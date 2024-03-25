# TODO: add routes for all methods

from fastapi import APIRouter

from qualibrate.api.routes.timeline_db.branch import timeline_db_branch_router
from qualibrate.api.routes.timeline_db.root import timeline_db_root_router
from qualibrate.api.routes.timeline_db.snapshot import (
    timeline_db_snapshot_router,
)
from qualibrate.api.routes.timeline_db.storage import timeline_db_storage_router

timeline_db_router = APIRouter(prefix="/timeline_db")

timeline_db_router.include_router(timeline_db_root_router)
timeline_db_router.include_router(timeline_db_branch_router)
timeline_db_router.include_router(timeline_db_storage_router)
timeline_db_router.include_router(timeline_db_snapshot_router)
