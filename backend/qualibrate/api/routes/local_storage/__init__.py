from fastapi import APIRouter

from qualibrate.api.routes.local_storage.branch import (
    local_storage_branch_router,
)
from qualibrate.api.routes.local_storage.root import local_storage_root_router
from qualibrate.api.routes.local_storage.snapshot import (
    local_storage_snapshot_router,
)

local_storage_router = APIRouter(prefix="/local_storage")

local_storage_router.include_router(local_storage_branch_router)
local_storage_router.include_router(local_storage_snapshot_router)
local_storage_router.include_router(local_storage_root_router)
