from fastapi import APIRouter

from qualibrate.api.routes.json_db.snapshot import json_db_snapshot_router


api_router = APIRouter()


@api_router.get("/")
def ping() -> str:
    return "pong"


api_router.include_router(json_db_snapshot_router)
