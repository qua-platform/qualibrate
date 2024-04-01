from typing import Annotated, Any, Optional, Sequence, Union

from fastapi import APIRouter, Depends, Query

from qualibrate.api.core.bases.branch import BranchLoadType
from qualibrate.api.core.bases.node import NodeLoadType
from qualibrate.api.core.bases.root import RootBase
from qualibrate.api.core.bases.snapshot import SnapshotLoadType
from qualibrate.api.core.local_storage.root import RootLocalStorage
from qualibrate.api.core.timeline_db.root import RootTimelineDb
from qualibrate.api.core.types import DocumentSequenceType, DocumentType, IdType
from qualibrate.api.dependencies.search import get_search_path
from qualibrate.config import QualibrateSettings, StorageType, get_settings

root_router = APIRouter(prefix="/root", tags=["root"])


def _get_root_instance(
    settings: Annotated[QualibrateSettings, Depends(get_settings)],
) -> RootBase:
    root_types = {
        StorageType.local_storage: RootLocalStorage,
        StorageType.timeline_db: RootTimelineDb,
    }
    return root_types[settings.storage_type]()


@root_router.get("/branch")
def get_branch(
    *,
    branch_name: str = "main",
    load_type: BranchLoadType = BranchLoadType.Full,
    root: Annotated[RootBase, Depends(_get_root_instance)],
) -> DocumentType:
    branch = root.get_branch(branch_name)
    branch.load(load_type)
    return branch.dump()


@root_router.get("/node")
def get_node_by_id(
    *,
    id: IdType,
    load_type: NodeLoadType = NodeLoadType.Full,
    root: Annotated[RootBase, Depends(_get_root_instance)],
) -> Optional[DocumentType]:
    node = root.get_node(id)
    node.load(load_type)
    return node.dump()


@root_router.get("/node/latest")
def get_latest_node(
    *,
    load_type: NodeLoadType = NodeLoadType.Full,
    root: Annotated[RootBase, Depends(_get_root_instance)],
) -> Optional[DocumentType]:
    node = root.get_node()
    node.load(load_type)
    return node.dump()


@root_router.get("/snapshot")
def get_snapshot_by_id(
    *,
    id: IdType,
    load_type: SnapshotLoadType = SnapshotLoadType.Metadata,
    root: Annotated[RootBase, Depends(_get_root_instance)],
) -> Optional[DocumentType]:
    snapshot = root.get_snapshot(id)
    snapshot.load(load_type)
    return snapshot.dump()


@root_router.get("/snapshot/latest")
def get_latest_snapshot(
    root: Annotated[RootBase, Depends(_get_root_instance)],
    load_type: SnapshotLoadType = SnapshotLoadType.Metadata,
) -> Optional[DocumentType]:
    snapshot = root.get_snapshot()
    snapshot.load(load_type)
    return snapshot.dump()


@root_router.get("/snapshots_history")
def get_snapshots_history(
    *,
    num: Annotated[int, Query(gt=0)] = 50,
    reverse: bool = False,
    root: Annotated[RootBase, Depends(_get_root_instance)],
) -> DocumentSequenceType:
    snapshots = root.get_latest_snapshots(num)
    snapshots_dumped = [snapshot.dump() for snapshot in snapshots]
    if reverse:
        snapshots_dumped = list(reversed(snapshots_dumped))
    return snapshots_dumped


@root_router.get("/nodes_history")
def get_nodes_history(
    *,
    num: Annotated[int, Query(gt=0)] = 50,
    reverse: bool = False,
    root: Annotated[RootBase, Depends(_get_root_instance)],
) -> DocumentSequenceType:
    nodes = root.get_latest_nodes(num)
    nodes_dumped = [node.dump() for node in nodes]
    if reverse:
        nodes_dumped = list(reversed(nodes_dumped))
    return nodes_dumped


@root_router.get("/search")
def search_snapshot(
    id: IdType,
    data_path: Annotated[Sequence[Union[str, int]], Depends(get_search_path)],
    root: Annotated[RootBase, Depends(_get_root_instance)],
) -> Any:
    return root.search_snapshot(id, data_path)
