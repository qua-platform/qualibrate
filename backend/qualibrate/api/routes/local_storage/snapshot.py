from typing import Annotated, Any, Mapping, Optional, Union

from fastapi import APIRouter, Depends, Path

from qualibrate.api.core.bases.snapshot import SnapshotLoadType
from qualibrate.api.core.local_storage.snapshot import SnapshotLocalStorage
from qualibrate.api.core.types import DocumentSequenceType, DocumentType, IdType
from qualibrate.api.dependencies.search import get_search_path

local_storage_snapshot_router = APIRouter(
    prefix="/snapshot/{id}", tags=["snapshot local storage"]
)


def _get_snapshot_instance(
    id: Annotated[IdType, Path()],
) -> SnapshotLocalStorage:
    return SnapshotLocalStorage(id=id)


@local_storage_snapshot_router.get("/")
def get(
    snapshot: Annotated[SnapshotLocalStorage, Depends(_get_snapshot_instance)],
) -> Optional[DocumentType]:
    snapshot.load(SnapshotLoadType.Full)
    return snapshot.content


@local_storage_snapshot_router.get("/history")
def get_history(
    num: int,
    snapshot: Annotated[SnapshotLocalStorage, Depends(_get_snapshot_instance)],
) -> DocumentSequenceType:
    snapshot.load(SnapshotLoadType.Metadata)
    return snapshot.get_latest_snapshots(num)


@local_storage_snapshot_router.get("/compare_by_id")
def compare_by_id(
    snapshot: Annotated[SnapshotLocalStorage, Depends(_get_snapshot_instance)],
    other_snapshot_id: IdType,
) -> Mapping[str, Mapping[str, Any]]:
    snapshot.load(SnapshotLoadType.Data)
    return snapshot.compare_by_id(other_snapshot_id)


@local_storage_snapshot_router.get("/search/data/values")
def search(
    snapshot: Annotated[SnapshotLocalStorage, Depends(_get_snapshot_instance)],
    data_path: Annotated[list[Union[str, int]], Depends(get_search_path)],
) -> Optional[DocumentSequenceType]:
    return snapshot.search(data_path, load=True)


@local_storage_snapshot_router.get("/search/data/value/any_depth")
def search_recursive(
    snapshot: Annotated[SnapshotLocalStorage, Depends(_get_snapshot_instance)],
    target_key: str,
) -> Optional[DocumentSequenceType]:
    return snapshot.search_recursive(target_key, load=True)
