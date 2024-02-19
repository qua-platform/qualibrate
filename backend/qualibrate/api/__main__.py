from fastapi import APIRouter

from qualibrate.api.routes.snapshot import snapshot_router
from qualibrate.api.routes.timeline import timeline_router


api_router = APIRouter()


@api_router.get("/")
def ping() -> str:
    return "pong"


api_router.include_router(timeline_router)
api_router.include_router(snapshot_router)
