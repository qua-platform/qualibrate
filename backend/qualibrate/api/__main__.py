from fastapi import APIRouter

from qualibrate.api.routes.timeline_db.root import timeline_db_root_router
from qualibrate.api.routes.timeline_db.branch import timeline_db_branch_router
from qualibrate.api.routes.timeline_db.storage import timeline_db_storage_router
from qualibrate.api.routes.timeline_db.snapshot import (
    timeline_db_snapshot_router,
)


api_router = APIRouter()


@api_router.get("/")
def ping() -> str:
    return "pong"


api_router.include_router(timeline_db_root_router)
api_router.include_router(timeline_db_branch_router)
api_router.include_router(timeline_db_storage_router)
api_router.include_router(timeline_db_snapshot_router)
