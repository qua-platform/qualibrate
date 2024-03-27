from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Path, Query

from qualibrate.api.core.bases.branch import BranchLoadType
from qualibrate.api.core.timeline_db.branch import BranchTimelineDb
from qualibrate.api.core.types import DocumentSequenceType, DocumentType, IdType

timeline_db_branch_router = APIRouter(
    prefix="/branch/{name}", tags=["branch timeline db"]
)


def _get_branch_instance(name: Annotated[str, Path()]) -> BranchTimelineDb:
    return BranchTimelineDb(name=name)


@timeline_db_branch_router.get("/")
def get(
    branch: Annotated[BranchTimelineDb, Depends(_get_branch_instance)],
) -> Optional[DocumentType]:
    branch.load(BranchLoadType.Full)
    return branch.dump()


@timeline_db_branch_router.get("/snapshot")
def get_snapshot(
    snapshot_id: IdType,
    branch: Annotated[BranchTimelineDb, Depends(_get_branch_instance)],
) -> Optional[DocumentType]:
    return branch.get_snapshot(snapshot_id).dump()


@timeline_db_branch_router.get("/snapshot/latest")
def get_latest_snapshot(
    branch: Annotated[BranchTimelineDb, Depends(_get_branch_instance)],
) -> Optional[DocumentType]:
    return branch.get_snapshot().dump()


@timeline_db_branch_router.get("/node")
def get_node(
    node_id: IdType,
    branch: Annotated[BranchTimelineDb, Depends(_get_branch_instance)],
) -> Optional[DocumentType]:
    return branch.get_node(node_id).dump()


@timeline_db_branch_router.get("/node/latest")
def get_latest_node(
    branch: Annotated[BranchTimelineDb, Depends(_get_branch_instance)],
) -> Optional[DocumentType]:
    return branch.get_node().dump()


@timeline_db_branch_router.get("/snapshots_history")
def get_snapshots_history(
    branch: Annotated[BranchTimelineDb, Depends(_get_branch_instance)],
    reverse: bool = False,
    num: int = Query(50, gt=0),
) -> DocumentSequenceType:
    history = branch.get_latest_snapshots(num)
    history_dumped = [snapshot.dump() for snapshot in history]
    if reverse:
        # TODO: make more correct relationship update
        return list(reversed(history_dumped))
    return history_dumped


@timeline_db_branch_router.get("/nodes_history")
def get_nodes_history(
    branch: Annotated[BranchTimelineDb, Depends(_get_branch_instance)],
    reverse: bool = False,
    num: int = Query(50, gt=0),
) -> DocumentSequenceType:
    history = branch.get_latest_nodes(num)
    history_dumped = [node.dump() for node in history]
    if reverse:
        # TODO: make more correct relationship update
        return list(reversed(history_dumped))
    return history_dumped
