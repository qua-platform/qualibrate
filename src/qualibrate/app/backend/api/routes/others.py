from collections.abc import Mapping
from typing import Any

from fastapi import APIRouter

from qualibrate_app.api.routes.utils import vars as routes_vars

other_router = APIRouter()


@other_router.get("/")
def ping() -> str:
    return "pong"


@other_router.get("/redirect", summary="Is redirect to any page needed")
def redirect() -> Mapping[str, Any]:
    if routes_vars.ACTIVE_PROJECT_NOT_SET:
        return {"page": "project"}
    return {"page": None}
