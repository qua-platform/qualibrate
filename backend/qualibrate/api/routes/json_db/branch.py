from typing import Annotated, Optional
from qualibrate.api.core.types import DocumentType, DocumentSequenceType

from fastapi import APIRouter, Depends, Path, Query

from qualibrate.api.core.json_db.branch import BranchJsonDb


json_db_branch_router = APIRouter(prefix="/branch/{name}", tags=["branch"])


def _get_branch_instance(name: Annotated[str, Path()]) -> BranchJsonDb:
    return BranchJsonDb(name=name)


@json_db_branch_router.get("/")
def get(
    branch: Annotated[BranchJsonDb, Depends(_get_branch_instance)],
) -> Optional[DocumentType]:
    branch.load()
    return branch.content


@json_db_branch_router.get("/history")
def get_history(
    branch: Annotated[BranchJsonDb, Depends(_get_branch_instance)],
    reverse: bool = False,
    num_snapshots: int = Query(50, gt=0),
) -> DocumentSequenceType:
    history = branch.get_last_snapshots(num_snapshots)
    if reverse:
        # TODO: make more correct relationship update
        return list(reversed(history))
    return history
