from qualibrate.app.api.core.models.snapshot import (
    ExecutionType,
    QubitOutcome,
    SimplifiedSnapshotWithMetadata,
    SimplifiedSnapshotWithOutcomes,
    SnapshotHistoryItem,
    SnapshotHistoryMetadata,
)
from qualibrate.app.api.core.types import IdType

__all__ = [
    "convert_to_history_item",
    "build_snapshot_tree",
    "compute_workflow_aggregates",
    "count_nested_items",
    "paginate_nested_items",
]


def convert_to_history_item(
    snapshot: SimplifiedSnapshotWithMetadata | SimplifiedSnapshotWithOutcomes,
) -> SnapshotHistoryItem:
    """Convert a SimplifiedSnapshotWithMetadata to a SnapshotHistoryItem.

    Args:
        snapshot: The simplified snapshot with metadata to convert.

    Returns:
        A SnapshotHistoryItem with extended metadata fields.
    """
    metadata_dict = snapshot.metadata.model_dump()

    # Get children and workflow_parent_id from metadata (needed for detection)
    children = metadata_dict.get("children")
    workflow_parent_id = metadata_dict.get("workflow_parent_id")

    # Get type_of_execution from metadata with on-the-fly detection for
    # legacy snapshots that don't have this field set.
    # If type_of_execution is missing, detect workflow by presence of
    # non-empty children list (eliminates need for manual migration).
    type_of_execution_str = metadata_dict.get("type_of_execution")
    if type_of_execution_str is None:
        # On-the-fly detection: if children exists and is non-empty, treat as workflow
        if children and isinstance(children, list) and len(children) > 0:
            type_of_execution_str = "workflow"
        else:
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
    clean_metadata_dict = {
        k: v for k, v in metadata_dict.items() if k not in fields_to_remove
    }

    # Create extended metadata
    history_metadata = SnapshotHistoryMetadata(
        **clean_metadata_dict,
        type_of_execution=type_of_execution,
        children=children,
        workflow_parent_id=workflow_parent_id,
    )

    # Extract raw outcomes if available (for nodes with outcomes data)
    # Convert raw outcomes format {"q1": "successful"} to QubitOutcome format
    raw_outcomes = None
    if hasattr(snapshot, "outcomes") and snapshot.outcomes:
        raw_outcomes = {}
        name = snapshot.metadata.name if snapshot.metadata else f"node_{snapshot.id}"
        for qubit_name, outcome_value in snapshot.outcomes.items():
            # Convert from Outcome enum values ("successful"/"failed") to QubitOutcome
            if outcome_value in ("successful", "success"):
                raw_outcomes[qubit_name] = QubitOutcome(status="success")
            elif outcome_value in ("failed", "failure", "error"):
                raw_outcomes[qubit_name] = QubitOutcome(
                    status="failure", failed_on=name
                )

    return SnapshotHistoryItem(
        id=snapshot.id,
        created_at=snapshot.created_at,
        parents=snapshot.parents,
        metadata=history_metadata,
        type_of_execution=type_of_execution,
        tags=tags,
        outcomes=raw_outcomes,
    )


def build_snapshot_tree(
    snapshots: list[SimplifiedSnapshotWithMetadata],
) -> list[SnapshotHistoryItem]:
    """Build a nested tree structure from a flat list of snapshots.

    This function creates a hierarchical tree where workflows contain
    their child nodes in the 'items' field. Only top-level items
    (those not children of other items in the result) are returned.

    Args:
        snapshots: Flat list of snapshots with metadata containing
            type_of_execution and children fields.

    Returns:
        List of top-level SnapshotHistoryItem with nested items for workflows.
    """
    # Convert all snapshots to history items and index by ID
    items_by_id: dict[IdType, SnapshotHistoryItem] = {}
    for snapshot in snapshots:
        item = convert_to_history_item(snapshot)
        items_by_id[item.id] = item

    # Build the tree by linking children to parents
    child_ids: set[IdType] = set()
    for item in items_by_id.values():
        if item.type_of_execution == ExecutionType.workflow:
            children_ids = item.metadata.children or []
            children_items = []
            for child_id in children_ids:
                if child_id in items_by_id:
                    children_items.append(items_by_id[child_id])
                    child_ids.add(child_id)
            if children_items:
                item.items = children_items
                # Compute aggregated statistics
                compute_workflow_aggregates(item)

    # Return only top-level items (not children of other items in this result)
    top_level_items = [
        item for item_id, item in items_by_id.items() if item_id not in child_ids
    ]

    return top_level_items


def compute_workflow_aggregates(workflow: SnapshotHistoryItem) -> None:
    """Compute aggregated statistics for a workflow from its children.

    This function recursively processes nested workflows and populates:
        - outcomes: merged outcomes with failure tracking
        - nodes_completed: count of successful nodes
        - nodes_total: total node count (including nested)
        - qubits_completed: count of successful qubits
        - qubits_total: total qubit count

    The aggregation logic:
        - For nodes: status "finished" or "success" counts as completed
        - For workflows: completed if more than half its nodes succeeded
        - Outcomes track failures with the first failure taking precedence

    Args:
        workflow: The workflow item to compute aggregates for.
    """
    if workflow.items is None:
        return

    merged_outcomes: dict[str, QubitOutcome] = {}
    nodes_completed = 0
    nodes_total = 0

    def _process_item(
        item: SnapshotHistoryItem, depth: int = 0
    ) -> dict[str, QubitOutcome]:
        """Recursively process an item and collect outcomes."""
        nonlocal nodes_completed, nodes_total
        item_outcomes: dict[str, QubitOutcome] = {}

        if item.type_of_execution == ExecutionType.workflow:
            # For nested workflows, process their children
            if item.items:
                for child in item.items:
                    child_outcomes = _process_item(child, depth + 1)
                    # Merge child outcomes
                    for qubit, outcome in child_outcomes.items():
                        if qubit not in item_outcomes:
                            item_outcomes[qubit] = outcome
                        elif outcome.status == "failure":
                            # Keep the first failure
                            if item_outcomes[qubit].status != "failure":
                                item_outcomes[qubit] = outcome
            # Count this workflow as a node
            nodes_total += 1
            # Workflow is successful if more than half its nodes succeeded
            if item.nodes_completed is not None and item.nodes_total is not None:
                if item.nodes_completed > item.nodes_total / 2:
                    nodes_completed += 1
        else:
            # For nodes, count and extract outcomes
            nodes_total += 1
            status = item.metadata.status if item.metadata else None
            if status in ("finished", "success"):
                nodes_completed += 1

            # Use real outcomes if available (from data.outcomes)
            if item.outcomes:
                # Use the real qubit outcomes (e.g., {"q1": QubitOutcome, "q2": QubitOutcome})
                for qubit_name, outcome in item.outcomes.items():
                    item_outcomes[qubit_name] = outcome
            else:
                # Fallback: create outcome based on node status (legacy behavior)
                name = item.metadata.name if item.metadata else f"node_{item.id}"
                if status in ("finished", "success"):
                    item_outcomes[f"node_{item.id}"] = QubitOutcome(status="success")
                elif status in ("error", "failure"):
                    item_outcomes[f"node_{item.id}"] = QubitOutcome(
                        status="failure", failed_on=name
                    )

        return item_outcomes

    # Process all children
    for child in workflow.items:
        child_outcomes = _process_item(child)
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
    workflow.qubits_completed = sum(
        1 for o in merged_outcomes.values() if o.status == "success"
    )
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
    """Paginate nested items counting all items including nested.

    This function flattens the tree structure for counting and pagination
    purposes, then filters the original tree to only include items that
    appear in the paginated slice.

    Note: Page numbers are 1-indexed (page 1 is the first page).

    Args:
        items: List of top-level snapshot history items with nested children.
        page: Page number (1-indexed).
        per_page: Number of items per page.

    Returns:
        Tuple of (paginated items preserving tree structure, total count).
    """
    # Flatten items for counting and pagination
    flat_items: list[SnapshotHistoryItem] = []

    def _flatten(item_list: list[SnapshotHistoryItem]) -> None:
        for item in item_list:
            flat_items.append(item)
            if item.items:
                _flatten(item.items)

    _flatten(items)

    total = len(flat_items)
    start = (page - 1) * per_page
    end = start + per_page

    # Get the paginated flat items
    paginated_flat = flat_items[start:end]

    # For the response, we need to return the original tree structure
    # but only including items that appear in the paginated slice
    paginated_ids = {item.id for item in paginated_flat}

    def _filter_tree(
        item_list: list[SnapshotHistoryItem],
    ) -> list[SnapshotHistoryItem]:
        result = []
        for item in item_list:
            if item.id in paginated_ids:
                # Include this item
                new_item = item.model_copy(deep=True)
                if new_item.items:
                    new_item.items = _filter_tree(new_item.items)
                result.append(new_item)
            elif item.items:
                # Check if any children are in paginated set
                filtered_children = _filter_tree(item.items)
                if filtered_children:
                    new_item = item.model_copy(deep=True)
                    new_item.items = filtered_children
                    result.append(new_item)
        return result

    result_items = _filter_tree(items)
    return result_items, total
