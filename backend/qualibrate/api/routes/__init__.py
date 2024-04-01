# TODO: setup default load types?

from fastapi import APIRouter

from qualibrate.api.routes.branch import branch_router
from qualibrate.api.routes.data_file import data_file_router
from qualibrate.api.routes.root import root_router
from qualibrate.api.routes.snapshot import snapshot_router

storage_router = APIRouter()

storage_router.include_router(root_router)
storage_router.include_router(branch_router)
storage_router.include_router(data_file_router)
storage_router.include_router(snapshot_router)
