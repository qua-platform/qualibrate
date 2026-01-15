from collections.abc import Sequence
from typing import Annotated

from fastapi import APIRouter, Depends, Path, Query
from qualibrate_config.models import QualibrateConfig, StorageType

from qualibrate_app.api.core.domain.bases.branch import (
    BranchBase,
    BranchLoadType,
)
from qualibrate_app.api.core.domain.bases.node import NodeLoadType
from qualibrate_app.api.core.domain.bases.snapshot import (
    SnapshotLoadTypeFlag,
)
from qualibrate_app.api.core.domain.local_storage.branch import (
    BranchLocalStorage,
)
from qualibrate_app.api.core.domain.timeline_db.branch import BranchTimelineDb
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
    get_snapshot_load_type_flag,
)
from qualibrate_app.config import get_settings

branch_router = APIRouter(prefix="/branch/{name}", tags=["branch"])


def _get_branch_instance(
    name: Annotated[
        str,
        Path(
            description=(
                "Branch name used to resolve which branch to operate on."
            ),
        ),
    ],
    settings: Annotated[QualibrateConfig, Depends(get_settings)],
) -> BranchBase:
    branch_types = {
        StorageType.local_storage: BranchLocalStorage,
        StorageType.timeline_db: BranchTimelineDb,
    }
    return branch_types[settings.storage.type](name=name, settings=settings)


@branch_router.get(
    "/",
    summary="Get branch by name",
)
def get(
    *,
    load_type: Annotated[
        BranchLoadType,
        Query(description="Level of detail to load for the branch."),
    ] = BranchLoadType.Full,
    branch: Annotated[BranchBase, Depends(_get_branch_instance)],
) -> BranchModel:
    """
    Retrieve a branch by name and load it with the requested level of detail.
    Returns serialized branch object (`BranchModel`) according to the selected
    `load_type`.

    ### Examples

    **Request:** `/branch/init_project?load_type=1`

    **Response:**
    ```json
    {
      "created_at": "2025-09-02T16:33:35+03:00",
      "id": 1,
      "name": "main",
      "snapshot_id": -1
    }
    ```
    """
    branch.load(load_type)
    return branch.dump()


@branch_router.get("/snapshot", summary="Get snapshot by ID")
def get_snapshot(
    *,
    snapshot_id: Annotated[
        IdType,
        Query(
            description="Identifier of the snapshot within the branch timeline."
        ),
    ],
    load_type_flag: Annotated[
        SnapshotLoadTypeFlag, Depends(get_snapshot_load_type_flag)
    ],
    branch: Annotated[BranchBase, Depends(_get_branch_instance)],
) -> SnapshotModel:
    """
    Loads and returns a single snapshot from the branch timeline using its
    identifier and the requested load-type flags.

    Returns  serialized snapshot (SnapshotModel) according to `load_type_flag`

    ### Example

    **Request:**
    `/branch/init_project/snapshot?snapshot_id=366\
    &load_type_flag=Metadata&load_type_flag=DataWithoutRefs`

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
        "run_duration": 6.049
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
    snapshot = branch.get_snapshot(snapshot_id)
    snapshot.load_from_flag(load_type_flag)
    return snapshot.dump()


@branch_router.get("/snapshot/latest", summary="Get latest snapshot")
def get_latest_snapshot(
    *,
    load_type_flag: Annotated[
        SnapshotLoadTypeFlag, Depends(get_snapshot_load_type_flag)
    ],
    branch: Annotated[BranchBase, Depends(_get_branch_instance)],
) -> SnapshotModel:
    """Get latest snapshot.

    Returns the most recent snapshot for the branch according to the underlying
    storage ordering.

    ### Example

    **Request:**
    `/branch/main/snapshot/latest?load_type_flag=Metadata`

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
    snapshot = branch.get_snapshot()
    snapshot.load_from_flag(load_type_flag)
    return snapshot.dump()


@branch_router.get("/snapshot/filter", summary="Get first matching snapshot")
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
    branch: Annotated[BranchBase, Depends(_get_branch_instance)],
) -> SnapshotModel | None:
    """
    Retrieve the newest (or oldest) snapshot that satisfies the provided
    criteria. Order is controlled by the `descending` flag. Use
    `/snapshots/filter` to get a paginated list of matches.

    Returns the newest (or oldest) matching snapshot, or `null` if nothing
    matches.

    ### Examples
    #### 1)
    **Request:**
    `/branch/main/snapshot/filter?descending=true`

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
    `/branch/main/snapshot/filter?descending=true&name_part=test_cal`

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
    `/branch/main/snapshot/filter?descending=true&\
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
    `/branch/main/snapshot/filter?descending=true&\
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
    `/branch/main/snapshot/filter?descending=false&name_part=test_cal\
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
    `/branch/main/snapshot/filter?descending=true&name_part=test_cal\
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
    _, snapshots = branch.get_latest_snapshots(
        pages_filter=PageFilter(per_page=1, page=1),
        search_filter=SearchWithIdFilter(**search_filters.model_dump()),
        descending=descending,
    )
    if len(snapshots) == 0:
        return None
    return snapshots[0].dump()


@branch_router.get("/node", deprecated=True)
def get_node(
    *,
    node_id: int,
    load_type: NodeLoadType = NodeLoadType.Full,
    branch: Annotated[BranchBase, Depends(_get_branch_instance)],
) -> NodeModel:
    node = branch.get_node(node_id)
    node.load(load_type)
    return node.dump()


@branch_router.get("/node/latest", deprecated=True)
def get_latest_node(
    *,
    load_type: NodeLoadType = NodeLoadType.Full,
    branch: Annotated[BranchBase, Depends(_get_branch_instance)],
) -> NodeModel:
    node = branch.get_node()
    node.load(load_type)
    return node.dump()


@branch_router.get("/snapshots_history", summary="List snapshots history")
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
    branch: Annotated[BranchBase, Depends(_get_branch_instance)],
) -> PagedCollection[SimplifiedSnapshotWithMetadata]:
    """List snapshots history.

    Returns a paginated list of snapshots for the branch. Order is controlled
    by the `descending` flag.

    ### Examples
    **Request:** `branch/init_project/snapshots_history?page=1&per_page=3`

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
    total, snapshots = branch.get_latest_snapshots(
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


@branch_router.get(
    "/snapshots/filter",
    summary="Paged filtered list of snapshots",
)
def get_snapshots_filtered(
    *,
    page_filter: Annotated[PageFilter, Depends(get_page_filter)],
    descending: Annotated[
        bool,
        Query(description="When true, order from newest to oldest."),
    ] = True,
    search_filters: Annotated[SearchFilter, Depends(get_search_filter)],
    branch: Annotated[BranchBase, Depends(_get_branch_instance)],
) -> PagedCollection[SimplifiedSnapshotWithMetadata]:
    """
    Retrieve the list of newest (or oldest) snapshots that satisfies the
    provided criteria. Order is controlled by the `descending` flag.
    Returns a paginated list of snapshots for the branch.

    ### Examples
    More filter examples can be found for
    `/branch/<branch_name>/snapshot/filter`

    #### 1)
    **Request:**
    `/branch/main/snapshots/filter?descending=true&page=1\
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
    `/branch/main/snapshots/filter?descending=true&page=5\
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
    total, snapshots = branch.get_latest_snapshots(
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


@branch_router.get("/nodes_history", deprecated=True)
def get_nodes_history(
    *,
    page_filter: Annotated[PageFilter, Depends(get_page_filter)],
    descending: bool = True,
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
    branch: Annotated[BranchBase, Depends(_get_branch_instance)],
) -> PagedCollection[NodeModel]:
    total, nodes = branch.get_latest_nodes(
        pages_filter=page_filter,
        descending=descending,
    )
    nodes_dumped = [node.dump() for node in nodes]
    return PagedCollection[NodeModel](
        page=page_filter.page,
        per_page=page_filter.per_page,
        total_items=total,
        items=nodes_dumped,
    )


@branch_router.get(
    "/snapshots/search",
    summary="Search values within snapshots",
)
def search_snapshots_data(
    *,
    data_path: Annotated[Sequence[str | int], Depends(get_search_path)],
    filter_no_change: Annotated[
        bool,
        Query(
            description=(
                "Exclude consecutive entries where the value did not change."
            )
        ),
    ] = True,
    page_filter: Annotated[PageFilter, Depends(get_page_filter)],
    descending: Annotated[
        bool,
        Query(description="When true, order results from newest to oldest."),
    ] = True,
    search_filters: Annotated[SearchFilter, Depends(get_search_filter)],
    branch: Annotated[BranchBase, Depends(_get_branch_instance)],
) -> PagedCollection[SnapshotSearchResult]:
    """
    Search for values in quam state along a passed `data_path` across
    matching snapshots. Returning a paginated result.

    ### Examples
    #### 1)

    **Request:**
    `/branch/main/snapshots/search?filter_no_change=false&descending=true\
    &data_path=channels.ch1.intermediate_frequency&page=1&per_page=3`

    Get quam values by path `channels.ch1.intermediate_frequency` from 3 latest
    snapshots. Compare with next example for check impact of `filter_no_change`.

    **Response:**
    ```json
    {
      "page": 1,
      "per_page": 3,
      "total_items": 0,
      "items": [
        {
          "key": null,
          "value": null,
          "snapshot": {
            "created_at": "2025-08-22T12:16:42+03:00",
            "id": 367,
            "parents": [
              366
            ]
          }
        },
        {
          "key": [
            "channels",
            "ch1",
            "intermediate_frequency"
          ],
          "value": 100000000,
          "snapshot": {
            "created_at": "2025-08-22T10:54:07+03:00",
            "id": 366,
            "parents": [
              365
            ]
          }
        },
        {
          "key": [
            "channels",
            "ch1",
            "intermediate_frequency"
          ],
          "value": 100000000,
          "snapshot": {
            "created_at": "2025-08-21T14:12:28+03:00",
            "id": 365,
            "parents": [
              364
            ]
          }
        }
      ],
      "has_next_page": true,
      "total_pages": 0
    }
    ```

    #### 2)
    **Request:**
    `/branch/main/snapshots/search?filter_no_change=true&descending=true\
    &data_path=channels.ch1.intermediate_frequency&page=1&per_page=3`

    Get quam values by path `channels.ch1.intermediate_frequency` from 3 latest
    snapshots with filtering if the value wasn't changed. Compare with previous
    example for check impact of `filter_no_change`.

    **Response:**
    ```json
    {
      "page": 1,
      "per_page": 3,
      "total_items": 0,
      "items": [
        {
          "key": null,
          "value": null,
          "snapshot": {
            "created_at": "2025-08-22T12:16:42+03:00",
            "id": 367,
            "parents": [
              366
            ]
          }
        },
        {
          "key": [
            "channels",
            "ch1",
            "intermediate_frequency"
          ],
          "value": 100000000,
          "snapshot": {
            "created_at": "2025-08-21T14:05:06+03:00",
            "id": 361,
            "parents": [
              360
            ]
          }
        },
        {
          "key": [
            "channels",
            "ch1",
            "intermediate_frequency"
          ],
          "value": 50000000,
          "snapshot": {
            "created_at": "2025-08-21T14:04:14+03:00",
            "id": 360,
            "parents": [
              359
            ]
          }
        }
      ],
      "has_next_page": true,
      "total_pages": 0
    }
    ```
    """
    total, seq = branch.search_snapshots_data(
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
