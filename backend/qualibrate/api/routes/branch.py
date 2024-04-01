from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Path, Query

from qualibrate.api.core.bases.branch import BranchBase, BranchLoadType
from qualibrate.api.core.bases.node import NodeLoadType
from qualibrate.api.core.bases.snapshot import SnapshotLoadType
from qualibrate.api.core.local_storage.branch import BranchLocalStorage
from qualibrate.api.core.timeline_db.branch import BranchTimelineDb
from qualibrate.api.core.types import DocumentSequenceType, DocumentType, IdType
from qualibrate.config import QualibrateSettings, StorageType, get_settings

branch_router = APIRouter(prefix="/branch/{name}", tags=["branch"])


def _get_branch_instance(
    name: Annotated[str, Path()],
    settings: Annotated[QualibrateSettings, Depends(get_settings)],
) -> BranchBase:
    branch_types = {
        StorageType.local_storage: BranchLocalStorage,
        StorageType.timeline_db: BranchTimelineDb,
    }
    return branch_types[settings.storage_type](name=name)


@branch_router.get("/")
def get(
    *,
    load_type: BranchLoadType = BranchLoadType.Full,
    branch: Annotated[BranchBase, Depends(_get_branch_instance)],
) -> Optional[DocumentType]:
    branch.load(load_type)
    return branch.dump()


@branch_router.get("/snapshot")
def get_snapshot(
    *,
    snapshot_id: IdType,
    branch: Annotated[BranchBase, Depends(_get_branch_instance)],
) -> Optional[DocumentType]:
    snapshot = branch.get_snapshot(snapshot_id)
    snapshot.load(SnapshotLoadType.Metadata)
    return snapshot.dump()


@branch_router.get("/snapshot/latest")
def get_latest_snapshot(
    branch: Annotated[BranchBase, Depends(_get_branch_instance)],
) -> Optional[DocumentType]:
    snapshot = branch.get_snapshot()
    snapshot.load(SnapshotLoadType.Metadata)
    return snapshot.dump()


@branch_router.get("/node")
def get_node(
    node_id: int,
    branch: Annotated[BranchBase, Depends(_get_branch_instance)],
) -> Optional[DocumentType]:
    node = branch.get_node(node_id)
    node.load(NodeLoadType.Full)
    return node.dump()


@branch_router.get("/node/latest")
def get_latest_node(
    branch: Annotated[BranchBase, Depends(_get_branch_instance)],
) -> Optional[DocumentType]:
    node = branch.get_node()
    node.load(NodeLoadType.Full)
    return node.dump()


@branch_router.get("/snapshots_history")
def get_snapshots_history(
    *,
    num: Annotated[int, Query(gt=0)] = 50,
    reverse: bool = False,
    branch: Annotated[BranchBase, Depends(_get_branch_instance)],
) -> DocumentSequenceType:
    snapshots = branch.get_latest_snapshots(num)
    snapshots_dumped = [snapshot.dump() for snapshot in snapshots]
    if reverse:
        # TODO: make more correct relationship update
        snapshots_dumped = list(reversed(snapshots_dumped))
    return snapshots_dumped


@branch_router.get("/nodes_history")
def get_nodes_history(
    *,
    num: Annotated[int, Query(gt=0)] = 50,
    reverse: bool = False,
    branch: Annotated[BranchBase, Depends(_get_branch_instance)],
) -> DocumentSequenceType:
    nodes = branch.get_latest_nodes(num)
    nodes_dumped = [node.dump() for node in nodes]
    if reverse:
        # TODO: make more correct relationship update
        nodes_dumped = list(reversed(nodes_dumped))
    return nodes_dumped
