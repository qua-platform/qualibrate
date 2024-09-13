from typing import Annotated

from fastapi import APIRouter, Body, Depends, Response, status
from fastapi.responses import JSONResponse

from qualibrate_composite.api.auth_middleware import encoded_password
from qualibrate_composite.config import QualibrateSettings, get_settings

base_router = APIRouter()

AUTH_COOKIE_LIFETIME = 7 * 24 * 60 * 60


@base_router.post("/login")
def login(
    password: Annotated[str, Body()],
    settings: Annotated[QualibrateSettings, Depends(get_settings)],
) -> Response:
    if settings.password is None or password == settings.password:
        response = Response()

        response.set_cookie(
            "Qualibrate-Token",
            encoded_password(password),
            max_age=AUTH_COOKIE_LIFETIME,
        )
    else:
        response = JSONResponse(
            {"detail": "Incorrect password"},
            status_code=status.HTTP_401_UNAUTHORIZED,
        )
        response.delete_cookie("Qualibrate-Token")
    return response
