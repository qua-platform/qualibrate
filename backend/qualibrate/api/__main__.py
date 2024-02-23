from fastapi import APIRouter

from qualibrate.api.routes.json_db.root import json_db_root_router
from qualibrate.api.routes.json_db.branch import json_db_branch_router
from qualibrate.api.routes.json_db.storage import json_db_storage_router
from qualibrate.api.routes.json_db.snapshot import json_db_snapshot_router


api_router = APIRouter()


@api_router.get("/")
def ping() -> str:
    return "pong"


api_router.include_router(json_db_root_router)
api_router.include_router(json_db_branch_router)
api_router.include_router(json_db_storage_router)
api_router.include_router(json_db_snapshot_router)
