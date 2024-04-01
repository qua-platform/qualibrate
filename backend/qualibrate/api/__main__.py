from fastapi import APIRouter

from qualibrate.api.routes import storage_router

api_router = APIRouter()


@api_router.get("/")
def ping() -> str:
    return "pong"


api_router.include_router(storage_router)
