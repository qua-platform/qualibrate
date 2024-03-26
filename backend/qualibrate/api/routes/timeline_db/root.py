from typing import Annotated, Any, Optional

from fastapi import APIRouter, Depends, Query

from qualibrate.api.core.bases.branch import BranchLoadType
from qualibrate.api.core.bases.node import NodeLoadType
from qualibrate.api.core.bases.snapshot import SnapshotLoadType
from qualibrate.api.core.timeline_db.root import RootTimelineDb
from qualibrate.api.core.types import DocumentSequenceType, DocumentType, IdType

timeline_db_root_router = APIRouter(tags=["root timeline db"])


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
    return snapshot.content


@timeline_db_root_router.get("/snapshot/search")
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
    return branch.content


@timeline_db_root_router.get("/get_last_snapshots")
def get_branch_history(
    root: Annotated[RootTimelineDb, Depends(_get_root_instance)],
    branch_name: str,
) -> DocumentSequenceType:
    return root.get_branch(branch_name).get_latest_snapshots()


@timeline_db_root_router.get("/node")
def get_node(
    root: Annotated[RootTimelineDb, Depends(_get_root_instance)],
    id: IdType,
) -> Optional[DocumentType]:
    node = root.get_node(id)
    node.load(NodeLoadType.Full)
    return {
        "snapshot": None if node.snapshot is None else node.snapshot.content,
        "storage": None if node.storage is None else node.storage.path,
    }
