from collections.abc import Sequence
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Query
from qualibrate_config.models import QualibrateConfig, StorageType

from qualibrate.app.api.core.domain.bases.branch import BranchLoadType
from qualibrate.app.api.core.domain.bases.node import NodeLoadType
from qualibrate.app.api.core.domain.bases.root import RootBase
from qualibrate.app.api.core.domain.bases.snapshot import (
    SnapshotLoadTypeFlag,
)
from qualibrate.app.api.core.domain.local_storage.root import RootLocalStorage
from qualibrate.app.api.core.domain.timeline_db.root import RootTimelineDb
from qualibrate.app.api.core.models.branch import Branch as BranchModel
from qualibrate.app.api.core.models.node import Node as NodeModel
from qualibrate.app.api.core.models.paged import PagedCollection
from qualibrate.app.api.core.models.snapshot import (
    ExecutionType,
    QubitOutcome,
    SimplifiedSnapshotWithMetadata,
    SnapshotHistoryItem,
    SnapshotHistoryMetadata,
    SnapshotSearchResult,
)
from qualibrate.app.api.core.models.snapshot import Snapshot as SnapshotModel
from qualibrate.app.api.core.types import (
    IdType,
    PageFilter,
    SearchFilter,
    SearchWithIdFilter,
    SortField,
    STATUS_SORT_PRIORITY,
)
from qualibrate.app.api.core.utils.common_utils import extract_tags_from_metadata
from qualibrate.app.api.core.utils.slice import get_page_slice
from qualibrate.app.api.dependencies.search import get_search_path
from qualibrate.app.api.routes.utils.dependencies import (
    get_page_filter,
    get_search_filter,
    get_search_with_id_filter,
    get_snapshot_load_type_flag,
)
from qualibrate.app.api.routes.utils.snapshot_history import (
    build_snapshot_tree,
    paginate_nested_items,
)
from qualibrate.app.api.routes.utils.sorting import get_sort_key
from qualibrate.app.config import (
    get_settings,
)

# Maximum page size for fetching all items when sorting/grouping is required.
# This is needed because sorting and grouping require all items in memory.
MAX_PAGE_SIZE_FOR_GROUPING = 100000

root_router = APIRouter(prefix="/root", tags=["root"])


def _get_root_instance(
    settings: Annotated[QualibrateConfig, Depends(get_settings)],
) -> RootBase:
    root_types = {
        StorageType.local_storage: RootLocalStorage,
        StorageType.timeline_db: RootTimelineDb,
    }
    return root_types[settings.storage.type](settings=settings)


def _snapshot_to_simplified(
    snapshot: Any,
) -> SimplifiedSnapshotWithMetadata:
    """Convert a snapshot to SimplifiedSnapshotWithMetadata with tags extracted.

    Args:
        snapshot: A snapshot instance with dump() method.

    Returns:
        SimplifiedSnapshotWithMetadata with tags populated from metadata.
    """
    dump = snapshot.dump().model_dump()
    metadata = dump.get("metadata", {})
    tags = extract_tags_from_metadata(metadata)

    # Remove tags from metadata to avoid duplication (tags are at top level)
    if isinstance(metadata, dict) and "tags" in metadata:
        metadata = {k: v for k, v in metadata.items() if k != "tags"}
        dump["metadata"] = metadata

    return SimplifiedSnapshotWithMetadata(**dump, tags=tags)


def _get_sort_key(
    snapshot: SimplifiedSnapshotWithMetadata,
    sort_field: SortField,
    descending: bool,
) -> tuple[int, Any]:
    """Get sort key for a snapshot based on the sort field.

    Returns a tuple of (priority, value) for stable sorting.
    Priority ensures None values are sorted last.
    """
    if sort_field == SortField.name:
        name = snapshot.metadata.name if snapshot.metadata else None
        # Use empty string for None to sort nulls last
        return (0 if name else 1, (name or "").lower())
    elif sort_field == SortField.date:
        # Use created_at for date sorting
        return (0 if snapshot.created_at else 1, snapshot.created_at)
    elif sort_field == SortField.status:
        status = snapshot.metadata.status if snapshot.metadata else None
        priority = STATUS_SORT_PRIORITY.get(status, len(STATUS_SORT_PRIORITY))
        return (priority, status or "")
    return (0, snapshot.id)


def _convert_to_history_item(
    snapshot: SimplifiedSnapshotWithMetadata,
) -> SnapshotHistoryItem:
    """Convert a SimplifiedSnapshotWithMetadata to a SnapshotHistoryItem."""
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
        tags = extract_tags_from_metadata(metadata_dict)

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

    return SnapshotHistoryItem(
        id=snapshot.id,
        created_at=snapshot.created_at,
        parents=snapshot.parents,
        metadata=history_metadata,
        type_of_execution=type_of_execution,
        tags=tags,
    )


def _build_snapshot_tree(
    snapshots: list[SimplifiedSnapshotWithMetadata],
) -> list[SnapshotHistoryItem]:
    """Build a nested tree structure from a flat list of snapshots.

    Args:
        snapshots: Flat list of snapshots with metadata containing
            type_of_execution and children fields.

    Returns:
        List of top-level SnapshotHistoryItem with nested items for workflows.
    """
    # Convert all snapshots to history items and index by ID
    items_by_id: dict[IdType, SnapshotHistoryItem] = {}
    for snapshot in snapshots:
        item = _convert_to_history_item(snapshot)
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
                _compute_workflow_aggregates(item)

    # Return only top-level items (not children of other items in this result)
    top_level_items = [
        item for item_id, item in items_by_id.items() if item_id not in child_ids
    ]

    return top_level_items


def _compute_workflow_aggregates(workflow: SnapshotHistoryItem) -> None:
    """Compute aggregated statistics for a workflow from its children.

    Populates:
        - outcomes: merged outcomes with failure tracking
        - nodes_completed: count of successful nodes
        - nodes_total: total node count (including nested)
        - qubits_completed: count of successful qubits
        - qubits_total: total qubit count
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
            # For nodes, count and extract outcomes from metadata
            nodes_total += 1
            status = item.metadata.status if item.metadata else None
            if status in ("finished", "success"):
                nodes_completed += 1

            # Try to get outcomes from data if available
            # Note: outcomes are typically in data.outcomes, but in history
            # we may not have full data. Use status as proxy.
            name = item.metadata.name if item.metadata else f"node_{item.id}"

            # Create outcome based on node status
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


def _count_nested_items(items: list[SnapshotHistoryItem]) -> int:
    """Count total items including nested children."""
    count = 0
    for item in items:
        count += 1
        if item.items:
            count += _count_nested_items(item.items)
    return count


def _filter_snapshots_by_tags(
    snapshots: list[SimplifiedSnapshotWithMetadata],
    required_tags: list[str],
) -> list[SimplifiedSnapshotWithMetadata]:
    """Filter snapshots to only those containing all required tags.

    Args:
        snapshots: List of snapshots to filter.
        required_tags: List of tag names that must all be present.

    Returns:
        Filtered list of snapshots that have ALL required tags.
    """
    if not required_tags:
        return snapshots

    required_set = set(required_tags)
    result = []
    for snapshot in snapshots:
        snapshot_tags = []
        if snapshot.metadata:
            # Get tags from metadata - handle both dict and object access
            metadata_dict = snapshot.metadata.model_dump()
            snapshot_tags = metadata_dict.get("tags", []) or []

        if required_set.issubset(set(snapshot_tags)):
            result.append(snapshot)

    return result


def _paginate_nested_items(
    items: list[SnapshotHistoryItem],
    page: int,
    per_page: int,
) -> tuple[list[SnapshotHistoryItem], int]:
    """Paginate nested items counting all items including nested.

    Returns:
        Tuple of (paginated items, total count)
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


@root_router.get("/branch", summary="Get branch by name")
def get_branch(
    *,
    branch_name: Annotated[
        str,
        Query(description="Name of the branch to fetch (e.g., init_project)."),
    ] = "main",
    load_type: Annotated[
        BranchLoadType,
        Query(description="Level of detail to load for the branch."),
    ] = BranchLoadType.Full,
    root: Annotated[RootBase, Depends(_get_root_instance)],
) -> BranchModel:
    """
    Retrieve a branch by name from the storage root and load it with the
    requested level of detail. Returns serialized branch object (`BranchModel`)
    according to the selected `load_type`.

    ### Examples

    **Request:** `/root/branch?branch_name=init_project&load_type=Full`

    **Response:**
    ```json
    {
      "created_at": "2025-09-02T16:33:35+03:00",
      "id": 1,
      "name": "init_project",
      "snapshot_id": -1
    }
    ```
    """
    branch = root.get_branch(branch_name)
    branch.load(load_type)
    return branch.dump()


@root_router.get("/node", deprecated=True)
def get_node_by_id(
    *,
    id: Annotated[IdType, Query(description="Node identifier.")],
    load_type: Annotated[
        NodeLoadType,
        Query(description="Level of detail to load for the node."),
    ] = NodeLoadType.Full,
    root: Annotated[RootBase, Depends(_get_root_instance)],
) -> NodeModel:
    """
    [Deprecated] Get node by ID

    Deprecated in favor of snapshot-based workflows.
    """
    node = root.get_node(id)
    node.load(load_type)
    return node.dump()


@root_router.get("/node/latest", deprecated=True)
def get_latest_node(
    *,
    load_type: Annotated[
        NodeLoadType,
        Query(description="Level of detail to load for the node."),
    ] = NodeLoadType.Full,
    root: Annotated[RootBase, Depends(_get_root_instance)],
) -> NodeModel:
    """
    [Deprecated] Get latest node

    Deprecated in favor of snapshot-based workflows.
    """
    node = root.get_node()
    node.load(load_type)
    return node.dump()


@root_router.get("/snapshot", summary="Get snapshot by ID")
def get_snapshot_by_id(
    *,
    id: Annotated[IdType, Query(description="Snapshot identifier.")],
    load_type_flag: Annotated[
        SnapshotLoadTypeFlag, Depends(get_snapshot_load_type_flag)
    ],
    root: Annotated[RootBase, Depends(_get_root_instance)],
) -> SnapshotModel:
    """
    Loads and returns a single snapshot from storage using its identifier and
    the requested load-type flags.

    Returns serialized snapshot (SnapshotModel) according to `load_type_flag`

    ### Example

    **Request:**
    `/root/snapshot?id=366&load_type_flag=Metadata\
    &load_type_flag=DataWithoutRefs`

    **Response:**
    ```json
    {
      "id": 366,
      "created_at": "2025-08-22T10:54:07+03:00",
      "metadata": {
        "description": "Test calibration that wait a few seconds, \
then plots random data.",
        "status": null,
        "run_start": "2025-08-22T10:54:01.247+03:00",
        "run_end": "2025-08-22T10:54:07.296+03:00",
        "run_duration": 6.049,
        "name": "test_cal",
        "data_path": "2025-08-22/#366_test_cal_105407",
      },
      "data": {
        "parameters": {
          "model": {
            "qubits": ["q1","q2"],
            "resonator": "q1.resonator",
            "sampling_points": 100
            },
          "schema": { "title": "Parameters", "type": "object" }
        },
        "outcomes": { "q1": "successful", "q2": "successful" },
        "quam": "./quam_state"
      },
      "parents": [365]
    }
    ```
    """
    snapshot = root.get_snapshot(id)
    snapshot.load_from_flag(load_type_flag)
    return snapshot.dump()


@root_router.get("/snapshot/latest", summary="Get latest snapshot")
def get_latest_snapshot(
    *,
    load_type_flag: Annotated[
        SnapshotLoadTypeFlag, Depends(get_snapshot_load_type_flag)
    ],
    root: Annotated[RootBase, Depends(_get_root_instance)],
) -> SnapshotModel:
    """Get latest snapshot.

    Returns the most recent snapshot for the storage according to the
    underlying storage ordering.

    ### Example

    **Request:**
    `/root/snapshot/latest?load_type_flag=Metadata`

    **Response:**
    ```json
    {
        "created_at": "2025-08-22T12:16:42+03:00",
        "id": 367,
        "parents": [366],
        "metadata": {
            "name": "wf_node1",
            "description": null,
            "status": null,
            "run_start": "2025-08-22T12:16:38.123000+03:00",
            "run_end": "2025-08-22T12:16:42.134000+03:00",
            "data_path": "2025-08-22/#367_wf_node1_121642",
            "run_duration": 4.011
        },
        "data": null
    }
    ```
    """
    snapshot = root.get_snapshot()
    snapshot.load_from_flag(load_type_flag)
    return snapshot.dump()


@root_router.get("/snapshot/filter", summary="Get first matching snapshot")
def get_snapshot_filtered(
    *,
    search_filters: Annotated[SearchFilter, Depends(get_search_filter)],
    descending: Annotated[
        bool,
        Query(
            description=(
                "When true, prefer the newest match; otherwise the oldest."
            )
        ),
    ] = True,
    root: Annotated[RootBase, Depends(_get_root_instance)],
) -> SnapshotModel | None:
    """
    Retrieve the newest (or oldest) snapshot that satisfies the provided
    criteria. Order is controlled by the `descending` flag. Use
    `/snapshots/filter` to get a paginated list of matches.

    Returns the newest (or oldest) matching snapshot, or `null`
    if nothing matches.

    ### Examples
    #### 1)
    **Request:**
    `/root/snapshot/filter?descending=true`

    Find latest snapshot.

    **Response:**
    ```json
    {
      "created_at": "2025-08-22T12:16:42+03:00",
      "id": 367,
      "parents": [366],
      "metadata": ...,
      "data": null
    }
    ```

    #### 2)
    **Request:**
    `/root/snapshot/filter?descending=true&name_part=test_cal`

    Find latest snapshot with name contains `test_cal`.

    **Response:**
    ```json
    {
      "created_at": "2025-08-22T10:54:07+03:00",
      "id": 366,
      "parents": [365],
      "metadata": ...,
      "data": null
    }
    ```
    #### 3)
    **Request:**
    `/root/snapshot/filter?descending=true&\
name_part=test_cal&max_node_id=365`

    Find latest snapshot with name contains `test_cal` and id less or
    equal to 365.

    **Response:**
    ```json
    {
      "created_at": "2025-08-21T14:12:28+03:00",
      "id": 365,
      "parents": [364],
      "metadata": ...,
      "data": null
    }
    ```
    #### 4)
    **Request:**
    `/root/snapshot/filter?descending=true&\
name_part=test_cal&max_node_id=365&max_date=2025-08-20`

    Find latest snapshot with :
    - name contains `test_cal`,
    - id less or equal to 365,
    - created earlier than 2025-08-20

    **Response:**
    ```json
    {
      "created_at": "2025-08-18T15:58:57+03:00",
      "id": 353,
      "parents": [352],
      "metadata": ...,
      "data": null
    }
    ```
    #### 5)
    **Request:**
    `/root/snapshot/filter?descending=false&name_part=test_cal\
    &min_node_id=100&max_node_id=365&min_date=2025-05-21&max_date=2025-08-20`

    Find **oldest** snapshot with :
    - name contains `test_cal`,
    - id in range(100, 365),
    - created in range (2025-05-21, 2025-08-20)

    **Response:**
    ```json
    {
        "created_at": "2025-05-21T09:54:09+03:00",
        "id": 290,
        "parents": [289],
        "metadata": ...,
        "data": null
    }
    ```

    #### 6)
    **Request:**
    `/root/snapshot/filter?descending=true&name_part=test_cal\
    &min_node_id=354&max_date=2025-08-20`

    Find latest snapshot with :
    - name contains `test_cal`,
    - id greater than or equal to 354,
    - created at less than or equal 2025-08-20

    There is no any snapshot satisfying the criteria.

    **Response:**
    ```json
    null
    ```
    """
    _, snapshots = root.get_latest_snapshots(
        pages_filter=PageFilter(per_page=1, page=1),
        search_filter=SearchWithIdFilter(**search_filters.model_dump()),
        descending=descending,
    )
    if len(snapshots) == 0:
        return None
    return snapshots[0].dump()


@root_router.get("/snapshots_history", summary="List snapshots history")
def get_snapshots_history(
    *,
    page_filter: Annotated[PageFilter, Depends(get_page_filter)],
    descending: Annotated[
        bool,
        Query(description="When true, order from newest to oldest."),
    ] = True,
    reverse: Annotated[
        bool,
        Query(
            deprecated=True,
            description="This field is ignored. Use `descending` instead.",
        ),
    ] = False,
    global_reverse: Annotated[
        bool,
        Query(
            deprecated=True,
            description="This field is ignored. Use `descending` instead.",
        ),
    ] = False,
    sort: Annotated[
        SortField | None,
        Query(
            description=(
                "Field to sort by: 'name' (alphabetical), 'date' (creation "
                "time), or 'status' (finished first, then skipped, pending, "
                "running, error). Default sorts by date."
            )
        ),
    ] = None,
    grouped: Annotated[
        bool,
        Query(
            description=(
                "When true, returns a nested structure with workflows "
                "containing their child nodes in an 'items' array. "
                "Workflows include aggregated statistics (outcomes, "
                "nodes_completed, etc.). When false (default), returns "
                "a flat list for backward compatibility."
            )
        ),
    ] = False,
    search_filters: Annotated[SearchFilter, Depends(get_search_filter)],
    root: Annotated[RootBase, Depends(_get_root_instance)],
) -> PagedCollection[SimplifiedSnapshotWithMetadata] | PagedCollection[
    SnapshotHistoryItem
]:
    """List snapshots history.

    Returns a paginated list of snapshots for the storage. Order is controlled
    by the `descending` flag. Optionally filter by date range, name, or node ID.
    Use the `sort` parameter to sort by name, date, or status.

    When `grouped=true`, returns a nested structure where workflows contain
    their child nodes in an 'items' array, with aggregated statistics including:
    - `type_of_execution`: "node" or "workflow"
    - `items`: nested child snapshots (for workflows)
    - `outcomes`: aggregated qubit outcomes with failure tracking
    - `nodes_completed` / `nodes_total`: node success counts
    - `qubits_completed` / `qubits_total`: qubit success counts

    ### Examples

    #### 1) Basic pagination (flat)
    **Request:** `/root/snapshots_history?page=1&per_page=3`

    **Response:**

    ```json
    {
      "page": 1,
      "per_page": 3,
      "total_items": 135,
      "items": [
        {
          "created_at": "2025-08-22T12:16:42+03:00",
          "id": 367,
          "parents": [366],
          "metadata": {"name": "wf_node1", ...}
        },
        ...
      ],
      "has_next_page": true,
      "total_pages": 45
    }
    ```

    #### 2) Grouped/nested structure
    **Request:** `/root/snapshots_history?page=1&per_page=3&grouped=true`

    **Response:**

    ```json
    {
      "page": 1,
      "per_page": 3,
      "total_items": 135,
      "items": [
        {
          "type_of_execution": "node",
          "created_at": "2025-08-22T12:16:42+03:00",
          "id": 168,
          "parents": [167],
          "metadata": {"name": "07_demo_rb", "status": "failure", ...}
        },
        {
          "type_of_execution": "workflow",
          "items": [
            {
              "type_of_execution": "node",
              "id": 169,
              "metadata": {"name": "graph_node1", "status": "success", ...}
            }
          ],
          "created_at": "2025-08-22T10:54:07+03:00",
          "id": 165,
          "parents": [174],
          "metadata": {"name": "10_basic_graph", "status": "failure", ...},
          "outcomes": {
            "q1": {"status": "failure", "failed_on": "graph_node1"},
            "q2": {"status": "success"}
          },
          "nodes_completed": 1,
          "nodes_total": 2,
          "qubits_completed": 1,
          "qubits_total": 2
        }
      ],
      "has_next_page": true,
      "total_pages": 45
    }
    ```

    #### 3) Filter by date range
    **Request:**
    `/root/snapshots_history?page=1&per_page=100&min_date=2025-08-21&max_date=2025-08-22`

    Returns snapshots created between 2025-08-21 and 2025-08-22 (inclusive).

    #### 4) Filter by exact name
    **Request:**
    `/root/snapshots_history?page=1&per_page=100&name=test_cal`

    Returns only snapshots with name exactly matching "test_cal".

    #### 5) Sort by name (A-Z)
    **Request:**
    `/root/snapshots_history?page=1&per_page=100&sort=name&descending=false`

    Returns snapshots sorted alphabetically by name (A to Z).

    #### 6) Sort by status (errors first)
    **Request:**
    `/root/snapshots_history?page=1&per_page=100&sort=status&descending=true`

    Returns snapshots sorted by status with errors first, then running,
    pending, skipped, and finished last.

    **Note:** Cannot use both `name` (exact match) and `name_part` (substring
    match) in the same request - this will return a 400 Bad Request error.
    """
    if search_filters.name is not None and search_filters.name_part is not None:
        raise HTTPException(
            status_code=400,
            detail=(
                "Cannot use both 'name' (exact match) and 'name_part' "
                "(substring match) parameters together. Use only one."
            ),
        )

    # For grouped mode or sorting, we need to fetch all snapshots first
    # because sorting and tree-building require all items in memory.
    # Check if we need to fetch all snapshots for post-filtering
    # Tag filtering requires loading metadata, so we need to fetch all first
    has_tag_filter = search_filters.tags is not None and len(search_filters.tags) > 0

    # For grouped mode, sorting, or tag filtering, we need to fetch all snapshots
    if grouped or sort is not None or has_tag_filter:
        all_pages_filter = PageFilter(page=1, per_page=MAX_PAGE_SIZE_FOR_GROUPING)
        _, all_snapshots = root.get_latest_snapshots(
            pages_filter=all_pages_filter,
            search_filter=SearchWithIdFilter(**search_filters.model_dump()),
            descending=False,  # We'll handle sorting/pagination ourselves
        )
        all_dumped = [
            _snapshot_to_simplified(snapshot)
            for snapshot in all_snapshots
        ]

        # Apply tag filtering if specified
        if has_tag_filter:
            all_dumped = _filter_snapshots_by_tags(
                all_dumped, search_filters.tags or []
            )

        if sort is not None:
            # Sort all snapshots by the requested field
            all_dumped = sorted(
                all_dumped,
                key=lambda s: get_sort_key(s, sort, descending),
                reverse=descending,
            )
        elif descending:
            # Apply descending order if not sorting
            all_dumped = list(reversed(all_dumped))

        if grouped:
            # Build nested tree structure
            tree_items = build_snapshot_tree(all_dumped)

            # Sort tree items using the same sort logic as the request parameter.
            # This fixes a bug where tree_items were always sorted by created_at
            # regardless of the user's sort parameter.
            if sort is not None:
                tree_items.sort(
                    key=lambda x: get_sort_key(
                        SimplifiedSnapshotWithMetadata(
                            id=x.id,
                            created_at=x.created_at,
                            parents=x.parents,
                            metadata=x.metadata,
                        ),
                        sort,
                        descending,
                    ),
                    reverse=descending,
                )
            else:
                # Default: sort by created_at (date)
                tree_items.sort(
                    key=lambda x: x.created_at or x.id, reverse=descending
                )

            # Paginate the nested items (counting all items including nested)
            paginated_items, total = paginate_nested_items(
                tree_items, page_filter.page, page_filter.per_page
            )

            return PagedCollection[SnapshotHistoryItem](
                page=page_filter.page,
                per_page=page_filter.per_page,
                total_items=total,
                items=paginated_items,
            )
        else:
            # Flat mode with sorting/filtering - apply pagination
            snapshots_dumped = list(get_page_slice(all_dumped, page_filter))
            total = len(all_dumped)

            return PagedCollection[SimplifiedSnapshotWithMetadata](
                page=page_filter.page,
                per_page=page_filter.per_page,
                total_items=total,
                items=snapshots_dumped,
            )
    else:
        # Original flow without sorting, grouping, or tag filtering
        total, snapshots = root.get_latest_snapshots(
            pages_filter=page_filter,
            search_filter=SearchWithIdFilter(**search_filters.model_dump()),
            descending=descending,
        )
        snapshots_dumped = [
            _snapshot_to_simplified(snapshot)
            for snapshot in snapshots
        ]

        return PagedCollection[SimplifiedSnapshotWithMetadata](
            page=page_filter.page,
            per_page=page_filter.per_page,
            total_items=total,
            items=snapshots_dumped,
        )


@root_router.get(
    "/snapshots/filter",
    summary="List snapshots filtered by metadata",
)
def get_snapshots_filtered(
    *,
    page_filter: Annotated[PageFilter, Depends(get_page_filter)],
    descending: Annotated[
        bool,
        Query(description="When true, order from newest to oldest."),
    ] = True,
    search_filters: Annotated[SearchFilter, Depends(get_search_filter)],
    root: Annotated[RootBase, Depends(_get_root_instance)],
) -> PagedCollection[SimplifiedSnapshotWithMetadata]:
    """
    Retrieve the list of newest (or oldest) snapshots that satisfies the
    provided criteria. Order is controlled by the `descending` flag.
    Returns a paginated list of snapshots for the storage.

    ### Examples
    More filter examples can be found for
    `/root/snapshot/filter`

    #### 1)
    **Request:**
    `/root/snapshots/filter?descending=true&page=1\
&per_page=2&name_part=test_cal`

    Find snapshots with name contains `test_cal`. Return 2 latest snapshots
    satisfying the criteria.

    **Response:**
    ```json
    {
      "page": 1,
      "per_page": 2,
      "total_items": 135,
      "items": [
        {
          "created_at": "2025-08-22T10:54:07+03:00",
          "id": 366,
          "parents": [365],
          "metadata": {
            "name": "test_cal",
            ...,
          }
        },
        {
          "created_at": "2025-08-21T14:12:28+03:00",
          "id": 365,
          "parents": [364],
          "metadata": {
            "name": "test_cal",
            ...,
          }
        }
      ],
      "has_next_page": true,
      "total_pages": 68
    }
    ```

    #### 2)
    **Request:**
    `/root/snapshots/filter?descending=true&page=5\
&per_page=2&name_part=test_cal`

    Find snapshots with name contains `test_cal`. Return 2 snapshots with
    skipping 8 ((page number - 1) * per_page) snapshots. Ordered with
    descending created at.

    **Response:**
    ```json
    {
        "page": 5,
        "per_page": 2,
        "total_items": 135,
        "items": [
        {
          "created_at": "2025-08-21T13:59:05+03:00",
          "id": 358,
          "parents": [
            357
          ],
          "metadata": {
            "name": "test_cal",
            ...,
          }
        },
        {
          "created_at": "2025-08-21T12:35:53+03:00",
          "id": 357,
          "parents": [
            356
          ],
          "metadata": {
            "name": "test_cal",
            ...,
          }
        }
      ],
      "has_next_page": true,
      "total_pages": 68
    }
    ```
    """
    total, snapshots = root.get_latest_snapshots(
        pages_filter=page_filter,
        search_filter=SearchWithIdFilter(**search_filters.model_dump()),
        descending=descending,
    )
    snapshots_dumped = [
        _snapshot_to_simplified(snapshot)
        for snapshot in snapshots
    ]
    return PagedCollection[SimplifiedSnapshotWithMetadata](
        page=page_filter.page,
        per_page=page_filter.per_page,
        total_items=total,
        items=snapshots_dumped,
    )


@root_router.get("/nodes_history", deprecated=True)
def get_nodes_history(
    *,
    page_filter: Annotated[PageFilter, Depends(get_page_filter)],
    descending: Annotated[
        bool,
        Query(description="When true, order from newest to oldest."),
    ] = True,
    reverse: Annotated[
        bool,
        Query(
            deprecated=True,
            description="This field is ignored. Use `descending` instead.",
        ),
    ] = False,
    global_reverse: Annotated[
        bool,
        Query(
            deprecated=True,
            description="This field is ignored. Use `descending` instead.",
        ),
    ] = False,
    root: Annotated[RootBase, Depends(_get_root_instance)],
) -> PagedCollection[NodeModel]:
    """[Deprecated] List nodes history (paged)."""
    total, nodes = root.get_latest_nodes(
        pages_filter=page_filter, descending=descending
    )
    nodes_dumped = [node.dump() for node in nodes]
    return PagedCollection[NodeModel](
        page=page_filter.page,
        per_page=page_filter.per_page,
        total_items=total,
        items=nodes_dumped,
    )


@root_router.get("/search", deprecated=True)
def search_snapshot(
    id: Annotated[IdType, Query(description="Snapshot id.")],
    data_path: Annotated[Sequence[str | int], Depends(get_search_path)],
    root: Annotated[RootBase, Depends(_get_root_instance)],
) -> Any:
    """
    [Deprecated] Search within a single snapshot by ID.
    Use `/root/snapshot/search`
    """
    return root.search_snapshot(SearchWithIdFilter(id=id), data_path)


@root_router.get(
    "/snapshot/search",
    summary="Extract values from a single snapshot",
)
def search_snapshot_data(
    *,
    search_filters: Annotated[
        SearchWithIdFilter, Depends(get_search_with_id_filter)
    ],
    data_path: Annotated[Sequence[str | int], Depends(get_search_path)],
    descending: Annotated[
        bool,
        Query(description="When true, list occurrences from newest to oldest."),
    ] = True,
    root: Annotated[RootBase, Depends(_get_root_instance)],
) -> Any:
    """
    Extract values from a single snapshot by specifying a data path into
    its JSON structure.

    The snapshot can be identified by ID or by matching metadata criteria
    (name, date, etc.). If metadata filters are used instead of an ID, the
    newest (or oldest) matching snapshot is selected.

    Use wildcards (`*`) in the data path to extract multiple values at once
    without knowing exact key names. For example, `qubits.*.id` returns the
    ID for every qubit.

    **Data Path Syntax:**
    - Dot notation: `channels.ch1.port` →
      `data["channels"]["ch1"]["port"]`
    - Wildcards: `qubits.*.id` → returns `id` for all qubits
      (13+ results instead of 1)
    - Array indices: `qubits.list.0` → first element in a list

    ### Example 1: Extract a single value

    **Request:**
    `/root/snapshot/search?id=366&`
    `data_path=channels.ch1.intermediate_frequency`

    **Response:**
    ```json
    [
      {
        "key": ["channels", "ch1", "intermediate_frequency"],
        "value": 100000000,
        "snapshot": {
          "id": 366,
          "created_at": "2025-08-22T10:54:07+03:00",
          "parents": [365]
        }
      }
    ]
    ```

    ### Example 2: Use wildcard to get multiple values

    **Request:**
    `/root/snapshot/search?id=977&`
    `data_path=qubits.q6_10.xy.operations.*.length`

    **Response (abbreviated):**
    ```json
    [
      {"key": ["qubits", "q6_10", "xy", "operations",
        "x180_DragCosine", "length"], "value": 24, ...},
      {"key": ["qubits", "q6_10", "xy", "operations",
        "x90_DragCosine", "length"],
        "value": "#../x180_DragCosine/length", ...},
      {"key": ["qubits", "q6_10", "xy", "operations",
        "-x90_DragCosine", "length"],
        "value": "#../x180_DragCosine/length", ...}
    ]
    ```
    Returns 13 operation lengths instead of just 1.
    """
    return root.search_snapshot(
        search_filters, data_path, descending=descending
    )


@root_router.get(
    "/snapshots/search", summary="Track parameter changes across snapshots"
)
def search_snapshots_data(
    *,
    data_path: Annotated[Sequence[str | int], Depends(get_search_path)],
    filter_no_change: Annotated[
        bool,
        Query(
            description=(
                "If true (default), only return snapshots where the value "
                "changed from the previous snapshot. Set to false to see "
                "all values."
            )
        ),
    ] = True,
    page_filter: Annotated[PageFilter, Depends(get_page_filter)],
    descending: Annotated[
        bool,
        Query(description="When true, order results from newest to oldest."),
    ] = True,
    search_filters: Annotated[SearchFilter, Depends(get_search_filter)],
    root: Annotated[RootBase, Depends(_get_root_instance)],
) -> PagedCollection[SnapshotSearchResult]:
    """
    Track how a specific parameter evolves across your calibration history.

    This endpoint searches for a value at a specific path across multiple
    snapshots, allowing you to see how calibration parameters change over
    time. Use `filter_no_change=true` (default) to see only snapshots where
    the value actually changed, or `filter_no_change=false` to see all
    snapshots including those where the value remained constant.

    You can filter snapshots by metadata (name, date range, etc.) to narrow
    down your search.

    **Use cases:**
    - Track how a qubit's frequency has been adjusted during calibration
    - Monitor pulse amplitude changes across experiments
    - Find when a specific parameter was last modified
    - Analyze calibration trends to optimize routines

    ### Example 1: See all parameter values (including unchanged)

    **Request:**
    `/root/snapshots/search?filter_no_change=false&descending=true&`
    `data_path=channels.ch1.intermediate_frequency&page=1&per_page=3`

    **Response (abbreviated):**
    ```json
    {
      "page": 1,
      "per_page": 3,
      "items": [
        {"key": null, "value": null, "snapshot": {"id": 367,
          "created_at": "2025-08-22T12:16:42+03:00"}},
        {"key": ["channels", "ch1", "intermediate_frequency"],
          "value": 100000000, "snapshot": {"id": 366,
          "created_at": "2025-08-22T10:54:07+03:00"}},
        {"key": ["channels", "ch1", "intermediate_frequency"],
          "value": 100000000, "snapshot": {"id": 365,
          "created_at": "2025-08-21T14:12:28+03:00"}}
      ]
    }
    ```
    Shows 3 results: two with the same value (100000000) and one missing
    value (null).

    ### Example 2: See only value changes (default)

    **Request:**
    `/root/snapshots/search?filter_no_change=true&descending=true&`
    `data_path=channels.ch1.intermediate_frequency&page=1&per_page=3`

    **Response (abbreviated):**
    ```json
    {
      "page": 1,
      "per_page": 3,
      "items": [
        {"key": ["channels", "ch1", "intermediate_frequency"],
          "value": 100000000, "snapshot": {"id": 361,
          "created_at": "2025-08-21T14:05:06+03:00"}},
        {"key": ["channels", "ch1", "intermediate_frequency"],
          "value": 50000000, "snapshot": {"id": 360,
          "created_at": "2025-08-21T14:04:14+03:00"}}
      ]
    }
    ```
    Shows only 2 results where the value actually changed
    (100000000 → 50000000), skipping unchanged entries.
    """
    total, seq = root.search_snapshots_data(
        data_path=data_path,
        filter_no_change=filter_no_change,
        pages_filter=page_filter,
        search_filter=SearchWithIdFilter(**search_filters.model_dump()),
        descending=descending,
    )

    return PagedCollection[SnapshotSearchResult](
        page=page_filter.page,
        per_page=page_filter.per_page,
        total_items=total,
        items=list(seq),
    )
