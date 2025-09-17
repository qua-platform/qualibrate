from fastapi import APIRouter

from qualibrate_app.api.routes import (
    project_router,
    projects_router,
    storage_router,
)

api_router = APIRouter()


@api_router.get("/")
def ping() -> str:
    return "pong"


api_router.include_router(project_router)
api_router.include_router(projects_router)
api_router.include_router(storage_router)
