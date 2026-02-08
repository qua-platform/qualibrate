import logging
from collections.abc import Callable
from typing import Any, cast

from qualibrate.app.api.core.models.snapshot import (
    QubitOutcome,
    SimplifiedSnapshotWithMetadata,
    SnapshotHistoryItem,
    SnapshotHistoryMetadata,
)
from qualibrate.app.api.core.types import IdType
from qualibrate.core.models.execution_type import ExecutionType

logger = logging.getLogger(__name__)

__all__ = [
    "convert_to_history_item",
    "build_snapshot_tree",
    "compute_workflow_aggregates",
    "count_nested_items",
    "paginate_nested_items",
]

# Type alias for the callback function that fetches missing snapshots by IDs
FetchMissingChildrenCallback = Callable[[set[IdType]], list[SimplifiedSnapshotWithMetadata]]


def convert_to_history_item(
    snapshot: SimplifiedSnapshotWithMetadata,
    raw_outcomes: dict[str, Any] | None = None,
) -> SnapshotHistoryItem:
    """Convert a SimplifiedSnapshotWithMetadata to a SnapshotHistoryItem.

    Args:
        snapshot: The simplified snapshot with metadata to convert.
        raw_outcomes: Optional raw outcomes dict from snapshot data (e.g., {"q1": "successful"}).
            This is used during aggregation to track actual qubit outcomes.

    Returns:
        A SnapshotHistoryItem with extended metadata fields.
    """
    metadata_dict = snapshot.metadata.model_dump()

    # Get children and workflow_parent_id from metadata (needed for detection)
    children = metadata_dict.get("children")
    workflow_parent_id = metadata_dict.get("workflow_parent_id")

    # Determine type_of_execution with robust detection logic.
    # The presence of children is the ground truth for workflow detection,
    # regardless of what type_of_execution says in metadata.
    # This handles:
    # 1. Legacy snapshots that don't have type_of_execution set
    # 2. Nested subgraphs that were incorrectly saved as "node" but have children
    has_children = children and isinstance(children, list) and len(children) > 0
    original_type = metadata_dict.get("type_of_execution")
    type_of_execution_str = original_type

    if has_children:
        # If snapshot has children, it's ALWAYS a workflow regardless of metadata
        type_of_execution_str = "workflow"
        if original_type != "workflow":
            logger.info(
                f"convert_to_history_item: Overriding type for id={snapshot.id}, "
                f"name={metadata_dict.get('name')}, "
                f"original_type={original_type} -> workflow, "
                f"children={children}"
            )
    elif type_of_execution_str is None:
        # No children and no type set - default to node
        type_of_execution_str = "node"

    try:
        type_of_execution = ExecutionType(type_of_execution_str)
    except ValueError:
        type_of_execution = ExecutionType.node

    # Get tags from snapshot (already extracted) or from metadata as fallback
    tags = snapshot.tags
    if tags is None:
        raw_tags = metadata_dict.get("tags")
        if isinstance(raw_tags, list):
            tags = [t for t in raw_tags if isinstance(t, str)] or None

    # Remove fields that will be set explicitly to avoid duplicate kwargs
    # Also remove tags to avoid duplication (tags are at top level of SnapshotHistoryItem)
    fields_to_remove = {"type_of_execution", "children", "workflow_parent_id", "tags"}
    clean_metadata_dict = {k: v for k, v in metadata_dict.items() if k not in fields_to_remove}

    # Create extended metadata
    history_metadata = SnapshotHistoryMetadata(
        **clean_metadata_dict,
        type_of_execution=type_of_execution,
        children=children,
        workflow_parent_id=workflow_parent_id,
    )

    item = SnapshotHistoryItem(
        id=snapshot.id,
        created_at=snapshot.created_at,
        parents=snapshot.parents,
        metadata=history_metadata,
        type_of_execution=type_of_execution,
        tags=tags,
    )

    # Store raw outcomes as a private attribute for use during aggregation
    # This allows compute_workflow_aggregates to access actual qubit outcomes
    item._raw_outcomes = raw_outcomes  # type: ignore[attr-defined]

    return item


def _collect_all_child_ids(
    snapshots: list[SimplifiedSnapshotWithMetadata],
) -> set[IdType]:
    """Collect all child IDs from workflow metadata.

    Args:
        snapshots: List of snapshots to scan for children.

    Returns:
        Set of all child IDs found in workflow metadata.
    """
    child_ids: set[IdType] = set()
    for snapshot in snapshots:
        metadata_dict = snapshot.metadata.model_dump()
        children = metadata_dict.get("children")
        if children and isinstance(children, list):
            child_ids.update(children)
    return child_ids


def _get_raw_outcomes(snapshot: SimplifiedSnapshotWithMetadata) -> dict[str, Any] | None:
    """Extract raw outcomes from a snapshot if available.

    The outcomes are stored in the snapshot's data.outcomes field when
    DataWithoutRefs flag is used during loading.

    Args:
        snapshot: The snapshot to extract outcomes from.

    Returns:
        Raw outcomes dict like {"q1": "successful", "q2": "failed"} or None.
    """
    # Check if snapshot has outcomes attribute (SimplifiedSnapshotWithMetadataAndOutcomes), outcomes is dict of any
    if hasattr(snapshot, "outcomes") and snapshot.outcomes is not None:
        return cast(dict[str, Any] | None, snapshot.outcomes)

    # Also check metadata for outcomes (may be stored there in some cases)
    metadata_dict = snapshot.metadata.model_dump()
    return cast(dict[str, Any] | None, metadata_dict.get("outcomes"))


def build_snapshot_tree(
    snapshots: list[SimplifiedSnapshotWithMetadata],
    fetch_missing_children: FetchMissingChildrenCallback | None = None,
) -> list[SnapshotHistoryItem]:
    """Build a nested tree structure from a flat list of snapshots.

    This function creates a hierarchical tree where workflows contain
    their child nodes in the 'items' field. Only top-level items
    (those not children of other items in the result) are returned.

    Args:
        snapshots: Flat list of snapshots with metadata containing
            type_of_execution and children fields.
        fetch_missing_children: Optional callback to fetch child snapshots
            that weren't included in the initial query. This ensures all
            workflow children are present regardless of pagination.

    Returns:
        List of top-level SnapshotHistoryItem with nested items for workflows.
    """
    # Build a mutable list that we can extend with fetched children
    all_snapshots = list(snapshots)
    snapshots_by_id: dict[IdType, SimplifiedSnapshotWithMetadata] = {s.id: s for s in all_snapshots}

    # Recursively fetch missing children if callback is provided
    if fetch_missing_children:
        # Keep fetching until we have all children
        iterations = 0
        max_iterations = 100  # Safety limit to prevent infinite loops
        while iterations < max_iterations:
            all_child_ids = _collect_all_child_ids(all_snapshots)
            missing_ids = all_child_ids - set(snapshots_by_id.keys())
            if not missing_ids:
                break
            # Fetch missing children
            missing_snapshots = fetch_missing_children(missing_ids)
            if not missing_snapshots:
                break
            # Add to our collections
            for s in missing_snapshots:
                if s.id not in snapshots_by_id:
                    snapshots_by_id[s.id] = s
                    all_snapshots.append(s)
            iterations += 1

    # Convert all snapshots to history items and index by ID
    items_by_id: dict[IdType, SnapshotHistoryItem] = {}
    for snapshot in all_snapshots:
        raw_outcomes = _get_raw_outcomes(snapshot)
        item = convert_to_history_item(snapshot, raw_outcomes)
        items_by_id[item.id] = item

    # Build the tree by linking children to parents
    child_ids: set[IdType] = set()
    workflows_processed = []
    for item in items_by_id.values():
        if item.type_of_execution == ExecutionType.workflow:
            children_ids = item.metadata.children or []
            children_items = []
            missing_children = []
            for child_id in children_ids:
                if child_id in items_by_id:
                    children_items.append(items_by_id[child_id])
                    child_ids.add(child_id)
                else:
                    missing_children.append(child_id)
            if children_items:
                item.items = children_items
                # Compute aggregated statistics
                compute_workflow_aggregates(item)
            workflows_processed.append(
                f"{item.id}({item.metadata.name}): "
                f"children_in_metadata={children_ids}, "
                f"found={len(children_items)}, "
                f"missing={missing_children}"
            )

    # Log workflow processing for troubleshooting
    if workflows_processed:
        logger.info(f"build_snapshot_tree: Processed {len(workflows_processed)} workflows: {workflows_processed}")

    # Also mark items with workflow_parent_id as children (they belong to a parent
    # workflow and should not appear at top level, even if the parent isn't in
    # the current result set - e.g., parent is still running or on another page)
    items_with_parent = []
    for item in items_by_id.values():
        workflow_parent_id = item.metadata.workflow_parent_id
        if workflow_parent_id is not None:
            child_ids.add(item.id)
            items_with_parent.append(f"{item.id}({item.metadata.name})->parent:{workflow_parent_id}")

    # Return only top-level items (not children of other items in this result)
    top_level_items = [item for item_id, item in items_by_id.items() if item_id not in child_ids]

    # Log summary for troubleshooting
    if items_with_parent:
        logger.info(
            f"build_snapshot_tree: {len(items_by_id)} items, "
            f"{len(child_ids)} filtered as children, "
            f"{len(top_level_items)} top-level. "
            f"Items with workflow_parent_id: {items_with_parent}"
        )

    return top_level_items


def compute_workflow_aggregates(workflow: SnapshotHistoryItem) -> None:
    """Compute aggregated statistics for a workflow from all nested children.

    This function processes a workflow and all its nested children and populates:
        - outcomes: merged outcomes with failure tracking (using actual qubit names)
        - nodes_completed: count of successful snapshots (including nested)
        - nodes_total: count of ALL snapshots (including subgraphs and their nested nodes)
        - qubits_completed: count of successful qubits
        - qubits_total: total qubit count

    Node counting rules:
        - nodes_total counts EVERY snapshot including the subgraph AND all nodes inside it
        - For example, if a workflow has:
            - node1
            - subgraph (with 2 internal nodes)
            - node2
          Then nodes_total = 5 (node1 + subgraph + 2 internal nodes + node2)

    Success determination:
        - For nodes: status "finished" or "success" counts as completed
        - For subgraphs: successful if MORE THAN HALF of its children are successful

    Args:
        workflow: The workflow item to compute aggregates for.
    """
    if workflow.items is None:
        return

    merged_outcomes: dict[str, QubitOutcome] = {}

    def _collect_outcomes(item: SnapshotHistoryItem) -> dict[str, QubitOutcome]:
        """Recursively collect outcomes from an item and its children."""
        item_outcomes: dict[str, QubitOutcome] = {}

        if item.type_of_execution == ExecutionType.workflow:
            # For nested workflows, recursively collect outcomes from children
            if item.items:
                for child in item.items:
                    child_outcomes = _collect_outcomes(child)
                    # Merge child outcomes
                    for qubit, outcome in child_outcomes.items():
                        if qubit not in item_outcomes:
                            item_outcomes[qubit] = outcome
                        elif outcome.status == "failure":
                            # Keep the first failure
                            if item_outcomes[qubit].status != "failure":
                                item_outcomes[qubit] = outcome

            # Store aggregated outcomes on the nested workflow
            if item_outcomes:
                item.outcomes = item_outcomes.copy()
                item.qubits_completed = sum(1 for o in item_outcomes.values() if o.status == "success")
                item.qubits_total = len(item_outcomes)
        else:
            # For nodes, extract actual qubit outcomes from raw_outcomes
            name = item.metadata.name if item.metadata else f"node_{item.id}"
            raw_outcomes = getattr(item, "_raw_outcomes", None)
            if raw_outcomes and isinstance(raw_outcomes, dict):
                for qubit, outcome_value in raw_outcomes.items():
                    outcome_str = str(outcome_value).lower()
                    if outcome_str in ("successful", "success"):
                        item_outcomes[qubit] = QubitOutcome(status="success")
                    elif outcome_str in ("failed", "failure", "error"):
                        item_outcomes[qubit] = QubitOutcome(status="failure", failed_on=name)

        return item_outcomes

    def _count_nodes_recursive(
        item: SnapshotHistoryItem,
    ) -> tuple[int, int]:
        """Recursively count total nodes and completed nodes.

        For subgraphs, success is determined by >50% of children being successful.

        Returns:
            Tuple of (nodes_total, nodes_completed) for this item and all nested.
        """
        if item.type_of_execution == ExecutionType.workflow and item.items:
            # This is a subgraph - count it as 1 node plus all its nested children
            child_total = 0
            child_completed = 0

            for child in item.items:
                ct, cc = _count_nodes_recursive(child)
                child_total += ct
                child_completed += cc

            # The subgraph itself counts as 1 node
            total = 1

            # Subgraph is successful if >50% of its DIRECT children are successful
            direct_children_count = len(item.items)
            direct_successful = 0
            for child in item.items:
                child_status = child.metadata.status if child.metadata else None
                if child_status in ("finished", "success"):
                    direct_successful += 1
                elif child.type_of_execution == ExecutionType.workflow:
                    # For nested subgraphs, check their computed success
                    # Use the >50% rule recursively
                    if child.items:
                        nested_direct = len(child.items)
                        nested_success = sum(
                            True
                            for c in child.items
                            if (status := c.metadata.status if c.metadata else None) is not None
                            and status in ("finished", "success")
                        )
                        if nested_success > nested_direct / 2:
                            direct_successful += 1

            # Subgraph counts as completed if >50% of direct children are successful
            subgraph_completed = 1 if direct_successful > direct_children_count / 2 else 0
            completed = subgraph_completed

            # Also set the subgraph's own nodes_total and nodes_completed
            item.nodes_total = child_total
            item.nodes_completed = child_completed

            return total, completed
        else:
            # This is a regular node - count as 1
            status = item.metadata.status if item.metadata else None
            is_completed = 1 if status in ("finished", "success") else 0
            return 1, is_completed

    # First, recursively compute aggregates for all nested workflows
    for child in workflow.items:
        if child.type_of_execution == ExecutionType.workflow and child.items:
            compute_workflow_aggregates(child)

    # Count all nodes recursively
    nodes_total = 0
    nodes_completed = 0
    for child in workflow.items:
        ct, cc = _count_nodes_recursive(child)
        nodes_total += ct
        nodes_completed += cc

    # Collect outcomes (recursively for nested workflows)
    for child in workflow.items:
        child_outcomes = _collect_outcomes(child)
        for qubit, outcome in child_outcomes.items():
            if qubit not in merged_outcomes:
                merged_outcomes[qubit] = outcome
            elif outcome.status == "failure":
                # Keep the first failure
                if merged_outcomes[qubit].status != "failure":
                    merged_outcomes[qubit] = outcome

    # Set computed fields
    workflow.outcomes = merged_outcomes if merged_outcomes else None
    workflow.nodes_completed = nodes_completed
    workflow.nodes_total = nodes_total
    workflow.qubits_completed = sum(1 for o in merged_outcomes.values() if o.status == "success")
    workflow.qubits_total = len(merged_outcomes)


def count_nested_items(items: list[SnapshotHistoryItem]) -> int:
    """Count total items including nested children.

    Args:
        items: List of snapshot history items to count.

    Returns:
        Total count of items including all nested children.
    """
    count = 0
    for item in items:
        count += 1
        if item.items:
            count += count_nested_items(item.items)
    return count


def paginate_nested_items(
    items: list[SnapshotHistoryItem],
    page: int,
    per_page: int,
) -> tuple[list[SnapshotHistoryItem], int]:
    """Paginate top-level items, keeping nested children intact.

    This function paginates on TOP-LEVEL items only. Each top-level item
    includes all its nested children. This ensures that when you request
    100 items per page, you get 100 top-level items (workflows and nodes),
    with each workflow containing all its nested children.

    Note: Page numbers are 1-indexed (page 1 is the first page).

    Args:
        items: List of top-level snapshot history items with nested children.
        page: Page number (1-indexed).
        per_page: Number of items per page.

    Returns:
        Tuple of (paginated top-level items with nested children, total top-level count).
    """
    # Count only top-level items for pagination (not nested children)
    total = len(items)
    start = (page - 1) * per_page
    end = start + per_page

    # Slice the top-level items directly
    paginated_items = items[start:end]

    return paginated_items, total
