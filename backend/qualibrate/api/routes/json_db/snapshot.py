from typing import Annotated, Union, Optional
from qualibrate.api.core.types import DocumentType, DocumentSequenceType

from fastapi import APIRouter, Depends, Path, Query

from qualibrate.api.core.json_db.snapshot import (
    SnapshotJsonDb,
    SnapshotLoadType,
)
from qualibrate.api.dependencies.search import get_search_path

json_db_snapshot_router = APIRouter(prefix="/snapshot/{id}", tags=["snapshot"])


def _get_snapshot_instance(id: Annotated[int, Path()]) -> SnapshotJsonDb:
    return SnapshotJsonDb(id=id)


@json_db_snapshot_router.get("/")
def get(
    snapshot: Annotated[SnapshotJsonDb, Depends(_get_snapshot_instance)],
    load_type: SnapshotLoadType = SnapshotLoadType.Full,
) -> Optional[DocumentType]:
    snapshot.load(load_type)
    return snapshot.content


@json_db_snapshot_router.get("/search/data/values")
def get_values(
    snapshot: Annotated[SnapshotJsonDb, Depends(_get_snapshot_instance)],
    data_path: Annotated[list[Union[str, int]], Depends(get_search_path)],
) -> Optional[DocumentSequenceType]:
    return snapshot.search(data_path, load=True)


@json_db_snapshot_router.get("/search/data/value/any_depth")
def get_values_any_depth(
    snapshot: Annotated[SnapshotJsonDb, Depends(_get_snapshot_instance)],
    target_key: str,
) -> Optional[DocumentSequenceType]:
    return snapshot.search_any_depth(target_key, load=True)


@json_db_snapshot_router.get("/history")
def get_history(
    snapshot: Annotated[SnapshotJsonDb, Depends(_get_snapshot_instance)],
    reverse: bool = False,
    num_snapshots: int = Query(50, gt=0),
) -> DocumentSequenceType:
    history = snapshot.history(num_snapshots=num_snapshots)
    if reverse:
        # TODO: make more correct relationship update
        return list(reversed(history))
    return history
