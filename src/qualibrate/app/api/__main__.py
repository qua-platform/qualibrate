from fastapi import APIRouter

from qualibrate_app.api.routes import (
    other_router,
    project_router,
    projects_router,
    storage_router,
)

api_router = APIRouter()

api_router.include_router(other_router)
api_router.include_router(project_router)
api_router.include_router(projects_router)
api_router.include_router(storage_router)
