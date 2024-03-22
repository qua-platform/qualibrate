from typing import Annotated, Optional

from fastapi import APIRouter, Path, Depends

from qualibrate.api.core.local_storage.branch import BranchLocalStorage
from qualibrate.api.core.types import DocumentType

local_storage_branch_router = APIRouter(
    prefix="/branch/{name}", tags=["branch local storage"]
)


def _get_branch_instance(name: Annotated[str, Path()]) -> BranchLocalStorage:
    return BranchLocalStorage(name=name)


@local_storage_branch_router.get("/")
def get(
    branch: Annotated[BranchLocalStorage, Depends(_get_branch_instance)],
) -> Optional[DocumentType]:
    print(branch)
    return branch.content
