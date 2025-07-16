from starlette import status
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from qualibrate_app.api.exceptions.classes.base import QualibrateException


async def qualibrate_exception_handler(
    request: Request, exc: QualibrateException
) -> Response:
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": str(exc)},
        headers={"X-Exception-Type": exc.__class__.__name__},
    )
