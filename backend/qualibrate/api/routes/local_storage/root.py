from typing import Annotated, Optional

from fastapi import APIRouter, Depends

from qualibrate.api.core.bases.node import NodeLoadType
from qualibrate.api.core.bases.snapshot import SnapshotLoadType

# from qualibrate.api.core.bases.snapshot import SnapshotLoadType
from qualibrate.api.core.local_storage.root import RootLocalStorage
from qualibrate.api.core.types import DocumentType, IdType

local_storage_root_router = APIRouter(
    prefix="/root", tags=["root local storage"]
)


def _get_root_instance() -> RootLocalStorage:
    return RootLocalStorage()


@local_storage_root_router.get("/node")
def get_node_by_id(
    root: Annotated[RootLocalStorage, Depends(_get_root_instance)],
    id: IdType,
    load_type: NodeLoadType = NodeLoadType.Full,
) -> Optional[DocumentType]:
    node = root.get_node(id)
    node.load(load_type)
    return {
        "snapshot": None if node.snapshot is None else node.snapshot.content,
        "storage": None if node.storage is None else node.storage.path,
    }


@local_storage_root_router.get("/node/latest")
def get_latest_node(
    root: Annotated[RootLocalStorage, Depends(_get_root_instance)],
    load_type: NodeLoadType = NodeLoadType.Full,
) -> Optional[DocumentType]:
    node = root.get_node()
    node.load(load_type)
    return {
        "snapshot": None if node.snapshot is None else node.snapshot.content,
        "storage": None if node.storage is None else node.storage.path,
    }


@local_storage_root_router.get("/snapshot")
def get_snapshot_by_id(
    root: Annotated[RootLocalStorage, Depends(_get_root_instance)],
    id: IdType,
    load_type: SnapshotLoadType = SnapshotLoadType.Metadata,
) -> Optional[DocumentType]:
    snapshot = root.get_snapshot(id)
    snapshot.load(load_type)
    return snapshot.content


@local_storage_root_router.get("/snapshot/latest")
def get_latest_snapshot(
    root: Annotated[RootLocalStorage, Depends(_get_root_instance)],
    load_type: SnapshotLoadType = SnapshotLoadType.Metadata,
) -> Optional[DocumentType]:
    snapshot = root.get_snapshot()
    snapshot.load(load_type)
    return snapshot.content
