import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException
from starlette.middleware.cors import CORSMiddleware
from starlette.routing import Mount
from starlette.types import ASGIApp, Receive, Scope, Send

from qualibrate.app.api.__main__ import api_router
from qualibrate.app.api.core.lifespan import app_lifespan
from qualibrate.app.api.exceptions.classes.base import QualibrateException
from qualibrate.app.api.exceptions.handler import qualibrate_exception_handler
from qualibrate.app.api.middleware.process_time import ProcessTimeMiddleware
from qualibrate.app.api.sockets import base_ws_router
from qualibrate.app.config.resolvers import (
    get_config_path,
    get_default_static_files_path,
    get_settings,
)

try:
    from json_timeline_database.app import app as json_timeline_db_app
except ImportError:
    json_timeline_db_app = None


class StaticFilesHTTPOnly(StaticFiles):
    """StaticFiles that only handles HTTP requests, not WebSocket."""

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] == "websocket":
            # For WebSocket requests, raise HTTPException to signal we don't handle this
            # This allows Starlette to properly propagate to other handlers
            raise HTTPException(status_code=404)
        if scope["type"] != "http":
            # For other non-HTTP types (like lifespan), just return
            return
        await super().__call__(scope, receive, send)


app = FastAPI(
    lifespan=app_lifespan,
    title="Qualibrate",
    openapi_url="/app_openapi.json",
    docs_url="/app_docs",
    exception_handlers={QualibrateException: qualibrate_exception_handler},
)
_settings = get_settings(get_config_path())

origins = [
    "http://localhost:8002",
    "http://localhost:8001",
    "http://127.0.0.1:8002",
    "http://127.0.0.1:8001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(ProcessTimeMiddleware)

app.include_router(api_router, prefix="/api")
app.include_router(base_ws_router, prefix="/ws")

static_files_path = (
    _settings.app.static_site_files
    if (_settings is not None and _settings.app is not None and _settings.app.static_site_files is not None)
    else get_default_static_files_path()
)
if static_files_path is None or not static_files_path.is_dir():
    raise RuntimeError("No static files found in config.toml or default location")
# Directory should exist - use custom class that skips WebSocket requests
app.mount(
    "/",
    StaticFilesHTTPOnly(directory=static_files_path, html=True),
    name="static",
)


def main(port: int, reload: bool) -> None:
    uvicorn.run("qualibrate.app.app:app", port=port, reload=reload)


if __name__ == "__main__":
    main(port=8001, reload=False)
