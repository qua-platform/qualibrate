from fastapi import APIRouter

from qualibrate.api.routes.timeline_db import timeline_db_router
from qualibrate.api.routes.local_storage import local_storage_router


api_router = APIRouter()


@api_router.get("/")
def ping() -> str:
    return "pong"


api_router.include_router(local_storage_router)
api_router.include_router(timeline_db_router)
