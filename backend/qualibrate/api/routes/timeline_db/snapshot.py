from typing import Annotated, Optional, Union

from fastapi import APIRouter, Depends, Path, Query

from qualibrate.api.core.timeline_db.snapshot import (
    SnapshotLoadType,
    SnapshotTimelineDb,
)
from qualibrate.api.core.types import DocumentSequenceType, DocumentType
from qualibrate.api.dependencies.search import get_search_path

timeline_db_snapshot_router = APIRouter(
    prefix="/snapshot/{id}", tags=["snapshot timeline db"]
)


def _get_snapshot_instance(id: Annotated[int, Path()]) -> SnapshotTimelineDb:
    return SnapshotTimelineDb(id=id)


@timeline_db_snapshot_router.get("/")
def get(
    snapshot: Annotated[SnapshotTimelineDb, Depends(_get_snapshot_instance)],
    load_type: SnapshotLoadType = SnapshotLoadType.Full,
) -> Optional[DocumentType]:
    snapshot.load(load_type)
    return snapshot.content


@timeline_db_snapshot_router.get("/search/data/values")
def get_values(
    snapshot: Annotated[SnapshotTimelineDb, Depends(_get_snapshot_instance)],
    data_path: Annotated[list[Union[str, int]], Depends(get_search_path)],
) -> Optional[DocumentSequenceType]:
    return snapshot.search(data_path, load=True)


@timeline_db_snapshot_router.get("/search/data/value/any_depth")
def get_values_any_depth(
    snapshot: Annotated[SnapshotTimelineDb, Depends(_get_snapshot_instance)],
    target_key: str,
) -> Optional[DocumentSequenceType]:
    return snapshot.search_recursive(target_key, load=True)


@timeline_db_snapshot_router.get("/history")
def get_history(
    snapshot: Annotated[SnapshotTimelineDb, Depends(_get_snapshot_instance)],
    reverse: bool = False,
    num_snapshots: int = Query(50, gt=0),
) -> DocumentSequenceType:
    history = snapshot.get_latest_snapshots(num_snapshots=num_snapshots)
    if reverse:
        # TODO: make more correct relationship update
        return list(reversed(history))
    return history


@timeline_db_snapshot_router.get("/compare")
def compare_snapshots(
    id_to_compare: int,
    snapshot: Annotated[SnapshotTimelineDb, Depends(_get_snapshot_instance)],
) -> DocumentType:
    return snapshot.compare_by_id(id_to_compare)
