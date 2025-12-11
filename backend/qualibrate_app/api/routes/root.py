from collections.abc import Sequence
from typing import Annotated, Any

from fastapi import APIRouter, Depends, Query
from qualibrate_config.models import QualibrateConfig, StorageType

from qualibrate_app.api.core.domain.bases.branch import BranchLoadType
from qualibrate_app.api.core.domain.bases.node import NodeLoadType
from qualibrate_app.api.core.domain.bases.root import RootBase
from qualibrate_app.api.core.domain.bases.snapshot import (
    SnapshotLoadTypeFlag,
)
from qualibrate_app.api.core.domain.local_storage.root import RootLocalStorage
from qualibrate_app.api.core.domain.timeline_db.root import RootTimelineDb
from qualibrate_app.api.core.models.branch import Branch as BranchModel
from qualibrate_app.api.core.models.node import Node as NodeModel
from qualibrate_app.api.core.models.paged import PagedCollection
from qualibrate_app.api.core.models.snapshot import (
    SimplifiedSnapshotWithMetadata,
    SnapshotSearchResult,
)
from qualibrate_app.api.core.models.snapshot import Snapshot as SnapshotModel
from qualibrate_app.api.core.types import (
    IdType,
    PageFilter,
    SearchFilter,
    SearchWithIdFilter,
)
from qualibrate_app.api.dependencies.search import get_search_path
from qualibrate_app.api.routes.utils.dependencies import (
    get_page_filter,
    get_search_filter,
    get_search_with_id_filter,
    get_snapshot_load_type_flag,
)
from qualibrate_app.config import (
    get_settings,
)

root_router = APIRouter(prefix="/root", tags=["root"])


def _get_root_instance(
    settings: Annotated[QualibrateConfig, Depends(get_settings)],
) -> RootBase:
    root_types = {
        StorageType.local_storage: RootLocalStorage,
        StorageType.timeline_db: RootTimelineDb,
    }
    return root_types[settings.storage.type](settings=settings)


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
    root: Annotated[RootBase, Depends(_get_root_instance)],
) -> PagedCollection[SimplifiedSnapshotWithMetadata]:
    """List snapshots history.

    Returns a paginated list of snapshots for the storage. Order is controlled
    by the `descending` flag.

    ### Examples
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
          "parents": [
            366
          ],
          "metadata": {
            "name": "wf_node1",
            ...,
          }
        },
        {
          "created_at": "2025-08-22T10:54:07+03:00",
          "id": 366,
          "parents": [
            365
          ],
          "metadata": {
            "name": "test_cal",
            ...,
          }
        },
        {
          "created_at": "2025-08-21T14:12:28+03:00",
          "id": 365,
          "parents": [
            364
          ],
          "metadata": {
            "name": "test_cal",
            ...,
          }
        }
      ],
      "has_next_page": true,
      "total_pages": 45
    }
    ```
    """
    total, snapshots = root.get_latest_snapshots(
        pages_filter=page_filter,
        descending=descending,
    )
    snapshots_dumped = [
        SimplifiedSnapshotWithMetadata(**snapshot.dump().model_dump())
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
        SimplifiedSnapshotWithMetadata(**snapshot.dump().model_dump())
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
