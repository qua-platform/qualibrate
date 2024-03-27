from typing import Annotated, Any, Optional

from fastapi import APIRouter, Depends, Query

from qualibrate.api.core.bases.branch import BranchLoadType
from qualibrate.api.core.bases.node import NodeLoadType
from qualibrate.api.core.bases.snapshot import SnapshotLoadType
from qualibrate.api.core.timeline_db.root import RootTimelineDb
from qualibrate.api.core.types import DocumentSequenceType, DocumentType, IdType

timeline_db_root_router = APIRouter(prefix="/root", tags=["root timeline db"])


def _get_root_instance() -> RootTimelineDb:
    return RootTimelineDb()


@timeline_db_root_router.get("/snapshot")
def get_snapshot(
    root: Annotated[RootTimelineDb, Depends(_get_root_instance)],
    id: IdType,
    load_type: SnapshotLoadType = SnapshotLoadType.Metadata,
) -> Optional[DocumentType]:
    snapshot = root.get_snapshot(id)
    snapshot.load(load_type)
    return snapshot.dump()


@timeline_db_root_router.get("/snapshot/latest")
def get_latest_snapshot(
    root: Annotated[RootTimelineDb, Depends(_get_root_instance)],
    load_type: SnapshotLoadType = SnapshotLoadType.Metadata,
) -> Optional[DocumentType]:
    snapshot = root.get_snapshot()
    snapshot.load(load_type)
    return snapshot.dump()


@timeline_db_root_router.get("/node")
def get_node(
    root: Annotated[RootTimelineDb, Depends(_get_root_instance)],
    id: IdType,
) -> Optional[DocumentType]:
    node = root.get_node(id)
    node.load(NodeLoadType.Full)
    return node.dump()


@timeline_db_root_router.get("/node/latest")
def get_latest_node(
    root: Annotated[RootTimelineDb, Depends(_get_root_instance)],
) -> Optional[DocumentType]:
    snapshot = root.get_node()
    snapshot.load(NodeLoadType.Full)
    return snapshot.dump()


@timeline_db_root_router.get("/search")
def get_snapshot_search(
    root: Annotated[RootTimelineDb, Depends(_get_root_instance)],
    id: IdType,
    data_path: Annotated[str, Query(description="Path to search")],
) -> Any:
    return root.search_snapshot(id, data_path)


@timeline_db_root_router.get("/branch")
def get_branch(
    root: Annotated[RootTimelineDb, Depends(_get_root_instance)],
    branch_name: str,
) -> Optional[DocumentType]:
    branch = root.get_branch(branch_name)
    branch.load(BranchLoadType.Full)
    return branch.dump()


@timeline_db_root_router.get("/snapshots_history")
def get_snapshots_history(
    *,
    num: Annotated[int, Query(gt=0)] = 50,
    reverse: Annotated[bool, Query(description="Temporary unused.")] = False,
    root: Annotated[RootTimelineDb, Depends(_get_root_instance)],
) -> DocumentSequenceType:
    # TODO: use reverse flag
    snapshots = root.get_latest_snapshots(num)
    return [snapshot.dump() for snapshot in snapshots]


@timeline_db_root_router.get("/nodes_history")
def get_nodes_history(
    *,
    num: Annotated[int, Query(gt=0)] = 50,
    reverse: Annotated[bool, Query(description="Temporary unused.")] = False,
    root: Annotated[RootTimelineDb, Depends(_get_root_instance)],
) -> DocumentSequenceType:
    # TODO: use reverse flag
    nodes = root.get_latest_nodes(num)
    return [node.dump() for node in nodes]
