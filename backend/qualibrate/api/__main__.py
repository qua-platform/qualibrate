from fastapi import APIRouter


api_router = APIRouter()


@api_router.get("/")
def ping() -> str:
    return "pong"
