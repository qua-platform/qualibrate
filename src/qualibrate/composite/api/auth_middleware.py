from starlette.middleware.base import (
    BaseHTTPMiddleware,
    RequestResponseEndpoint,
)
from starlette.requests import Request
from starlette.responses import JSONResponse, Response
from starlette.types import ASGIApp

from qualibrate_composite.config import get_config_path, get_settings


def encoded_password(password: str) -> str:
    return password.encode().hex()


class RunnerAuthMiddleware(BaseHTTPMiddleware):
    def __init__(
        self,
        app: ASGIApp,
    ):
        super().__init__(app)
        self._settings = get_settings(get_config_path())

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        if (
            request.url.path.endswith("/docs")
            or request.url.path.endswith("/openapi.json")
            or self._settings.password is None
            or (
                request.cookies.get("Qualibrate-Token")
                == encoded_password(self._settings.password)
            )
        ):
            return await call_next(request)
        response = JSONResponse(
            {"detail": "Qualibrate-Token cookie not specified or invalid"},
            status_code=401,
        )
        response.delete_cookie("Qualibrate-Token")
        return response


class QualibrateAppAuthMiddleware(BaseHTTPMiddleware):
    def __init__(
        self,
        app: ASGIApp,
    ):
        super().__init__(app)
        self._settings = get_settings(get_config_path())

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        if (
            not request.url.path.startswith("/api")  # only for api
            or self._settings.password is None
            or (
                request.cookies.get("Qualibrate-Token")
                == encoded_password(self._settings.password)
            )
        ):
            return await call_next(request)
        return JSONResponse(
            {"detail": "Qualibrate-Token cookie not specified or invalid"},
            status_code=401,
        )
