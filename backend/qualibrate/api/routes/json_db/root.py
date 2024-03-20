from typing import Annotated, Optional, Any
from fastapi import APIRouter, Depends, Query

from qualibrate.api.core.types import DocumentType, DocumentSequenceType, IdType
from qualibrate.api.core.bases.branch import BranchLoadType
from qualibrate.api.core.json_db.node import NodeLoadType
from qualibrate.api.core.json_db.root import RootTimelineDb
from qualibrate.api.core.json_db.snapshot import SnapshotLoadType


json_db_root_router = APIRouter(tags=["root"])


def _get_root_instance() -> RootTimelineDb:
    return RootTimelineDb()


@json_db_root_router.get("/snapshot")
def get_snapshot(
    root: Annotated[RootTimelineDb, Depends(_get_root_instance)],
    id: IdType,
    load_type: SnapshotLoadType = SnapshotLoadType.Metadata,
) -> Optional[DocumentType]:
    snapshot = root.get_snapshot(id)
    snapshot.load(load_type)
    return snapshot.content


@json_db_root_router.get("/snapshot/search")
def get_snapshot_search(
    root: Annotated[RootTimelineDb, Depends(_get_root_instance)],
    id: IdType,
    data_path: Annotated[str, Query(description="Path to search")],
) -> Any:
    return root.search_snapshot(id, data_path)


@json_db_root_router.get("/branch")
def get_branch(
    root: Annotated[RootTimelineDb, Depends(_get_root_instance)],
    branch_name: str,
) -> Optional[DocumentType]:
    branch = root.get_branch(branch_name)
    branch.load(BranchLoadType.Full)
    return branch.content


@json_db_root_router.get("/get_last_snapshots")
def get_branch_history(
    root: Annotated[RootTimelineDb, Depends(_get_root_instance)],
    branch_name: str,
) -> DocumentSequenceType:
    return root.get_last_snapshots(branch_name)


@json_db_root_router.get("/node")
def get_node(
    root: Annotated[RootTimelineDb, Depends(_get_root_instance)],
    id: IdType,
) -> Optional[DocumentType]:
    node = root.get_node(id)
    node.load(NodeLoadType.Full)
    snapshot = node.snapshot
    return {
        "snapshot": None if snapshot is None else snapshot.content,
        "storage": None if node.storage is None else node.storage.path,
    }
