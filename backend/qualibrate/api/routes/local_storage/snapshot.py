from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Path

from qualibrate.api.core.bases.snapshot import SnapshotLoadType
from qualibrate.api.core.local_storage.snapshot import SnapshotLocalStorage
from qualibrate.api.core.types import DocumentSequenceType, DocumentType, IdType

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
