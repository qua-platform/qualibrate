from typing import Annotated, Any, Mapping, Optional, Type, Union

from fastapi import APIRouter, Depends, Path

from qualibrate.api.core.bases.snapshot import SnapshotBase, SnapshotLoadType
from qualibrate.api.core.local_storage.snapshot import SnapshotLocalStorage
from qualibrate.api.core.timeline_db.snapshot import SnapshotTimelineDb
from qualibrate.api.core.types import DocumentSequenceType, DocumentType, IdType
from qualibrate.api.dependencies.search import get_search_path
from qualibrate.config import QualibrateSettings, StorageType, get_settings

snapshot_router = APIRouter(prefix="/snapshot/{id}", tags=["snapshot"])


def _get_snapshot_instance(
    id: Annotated[IdType, Path()],
    settings: Annotated[QualibrateSettings, Depends(get_settings)],
) -> SnapshotBase:
    snapshot_types: dict[StorageType, Type[SnapshotBase]] = {
        StorageType.local_storage: SnapshotLocalStorage,
        StorageType.timeline_db: SnapshotTimelineDb,
    }
    return snapshot_types[settings.storage_type](id=id)


@snapshot_router.get("/")
def get(
    *,
    load_type: SnapshotLoadType = SnapshotLoadType.Full,
    snapshot: Annotated[SnapshotBase, Depends(_get_snapshot_instance)],
) -> Optional[DocumentType]:
    snapshot.load(load_type)
    return snapshot.dump()


@snapshot_router.get("/history")
def get_history(
    *,
    num: int,
    reverse: bool = False,
    snapshot: Annotated[SnapshotBase, Depends(_get_snapshot_instance)],
) -> DocumentSequenceType:
    history = snapshot.get_latest_snapshots(num)
    history_dumped = [snapshot.dump() for snapshot in history]
    if reverse:
        # TODO: make more correct relationship update
        return list(reversed(history_dumped))
    return history_dumped


@snapshot_router.get("/compare")
def compare_by_id(
    id_to_compare: IdType,
    snapshot: Annotated[SnapshotBase, Depends(_get_snapshot_instance)],
) -> Mapping[str, Mapping[str, Any]]:
    return snapshot.compare_by_id(id_to_compare)


@snapshot_router.get("/search/data/values")
def search(
    snapshot: Annotated[SnapshotBase, Depends(_get_snapshot_instance)],
    data_path: Annotated[list[Union[str, int]], Depends(get_search_path)],
) -> Optional[DocumentSequenceType]:
    return snapshot.search(data_path, load=True)


@snapshot_router.get("/search/data/value/any_depth")
def search_recursive(
    snapshot: Annotated[SnapshotBase, Depends(_get_snapshot_instance)],
    target_key: str,
) -> Optional[DocumentSequenceType]:
    return snapshot.search_recursive(target_key, load=True)
