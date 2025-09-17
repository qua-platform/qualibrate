from fastapi import APIRouter

from qualibrate_app.api.routes.branch import branch_router
from qualibrate_app.api.routes.data_file import data_file_router
from qualibrate_app.api.routes.project import project_router, projects_router
from qualibrate_app.api.routes.root import root_router
from qualibrate_app.api.routes.snapshot import snapshot_router

__all__ = ["project_router", "projects_router", "storage_router"]

storage_router = APIRouter()

storage_router.include_router(root_router)
storage_router.include_router(branch_router)
storage_router.include_router(data_file_router)
storage_router.include_router(snapshot_router)
