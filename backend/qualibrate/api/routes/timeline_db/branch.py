from typing import Annotated, Optional
from fastapi import APIRouter, Depends, Path, Query
from qualibrate.api.core.types import DocumentType, DocumentSequenceType
from qualibrate.api.core.bases.branch import BranchLoadType
from qualibrate.api.core.timeline_db.branch import BranchTimelineDb


timeline_db_branch_router = APIRouter(prefix="/branch/{name}", tags=["branch"])


def _get_branch_instance(name: Annotated[str, Path()]) -> BranchTimelineDb:
    return BranchTimelineDb(name=name)


@timeline_db_branch_router.get("/")
def get(
    branch: Annotated[BranchTimelineDb, Depends(_get_branch_instance)],
) -> Optional[DocumentType]:
    branch.load(BranchLoadType.Full)
    return branch.content


@timeline_db_branch_router.get("/history")
def get_history(
    branch: Annotated[BranchTimelineDb, Depends(_get_branch_instance)],
    reverse: bool = False,
    num_snapshots: int = Query(50, gt=0),
) -> DocumentSequenceType:
    history = branch.get_latest_snapshots(num_snapshots)
    if reverse:
        # TODO: make more correct relationship update
        return list(reversed(history))
    return history
