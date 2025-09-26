from typing import Annotated

from fastapi import APIRouter, Body, Depends, Response, status
from fastapi.responses import JSONResponse
from qualibrate_config.models import QualibrateConfig

from qualibrate_composite.api.auth_middleware import encoded_password
from qualibrate_composite.config import get_settings

base_router = APIRouter()

AUTH_COOKIE_LIFETIME = 7 * 24 * 60 * 60


@base_router.get("/login_required")
def login_required(
    settings: Annotated[QualibrateConfig, Depends(get_settings)],
) -> bool:
    return settings.password is not None


@base_router.post("/login")
def login(
    password: Annotated[str | None, Body()] = None,
    *,
    settings: Annotated[QualibrateConfig, Depends(get_settings)],
) -> Response:
    if settings.password is None or password == settings.password:
        response = Response()
        password = encoded_password(password) if password else ""
        response.set_cookie(
            "Qualibrate-Token",
            password,
            max_age=AUTH_COOKIE_LIFETIME,
        )
    else:
        response = JSONResponse(
            {"detail": "Incorrect password"},
            status_code=status.HTTP_401_UNAUTHORIZED,
        )
        response.delete_cookie("Qualibrate-Token")
    return response
