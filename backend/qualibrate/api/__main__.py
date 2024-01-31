from fastapi import APIRouter

api_router = APIRouter(prefix="/api")


@api_router.get("/")
def ping():
    return "pong"
