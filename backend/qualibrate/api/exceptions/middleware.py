from starlette import status
from starlette.types import ASGIApp
from starlette.requests import Request
from starlette.responses import Response, JSONResponse
from starlette.middleware.base import (
    BaseHTTPMiddleware,
    RequestResponseEndpoint,
)

from qualibrate.api.exceptions.classes.base import QualibrateException


async def add_process_time_header(
    request: Request, call_next: RequestResponseEndpoint
) -> Response:
    try:
        return await call_next(request)
    except QualibrateException as exc:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": str(exc)},
            headers={"X-Exception-Type": exc.__class__.__name__},
        )


class QualibrateCatchExcMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp):
        super().__init__(app, dispatch=add_process_time_header)
