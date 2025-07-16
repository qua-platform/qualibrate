import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware

from qualibrate_app.api.__main__ import api_router
from qualibrate_app.api.exceptions.classes.base import QualibrateException
from qualibrate_app.api.exceptions.handler import qualibrate_exception_handler
from qualibrate_app.config.resolvers import (
    get_config_path,
    get_default_static_files_path,
    get_settings,
)

try:
    from json_timeline_database.app import app as json_timeline_db_app
except ImportError:
    json_timeline_db_app = None


app = FastAPI(
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

app.include_router(api_router, prefix="/api")

static_files_path = (
    _settings.app.static_site_files
    if (
        _settings is not None
        and _settings.app is not None
        and _settings.app.static_site_files is not None
    )
    else get_default_static_files_path()
)
if static_files_path is None or not static_files_path.is_dir():
    raise RuntimeError(
        "No static files found in config.toml or default location"
    )
# Directory should exist
app.mount(
    "/",
    StaticFiles(directory=static_files_path, html=True),
    name="static",
)


def main(port: int, reload: bool) -> None:
    uvicorn.run("qualibrate_app.app:app", port=port, reload=reload)


if __name__ == "__main__":
    main(port=8001, reload=False)
