import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware

from qualibrate_app.api.__main__ import api_router
from qualibrate_app.api.exceptions.middleware import (
    QualibrateCatchExcMiddleware,
)
from qualibrate_app.config import StorageType, get_config_path, get_settings

try:
    from json_timeline_database.app import app as json_timeline_db_app
except ImportError:
    json_timeline_db_app = None


app = FastAPI(title="Qualibrate")
_settings = get_settings(get_config_path())

origins = ["http://localhost:8002", "http://localhost:8001"]

app.add_middleware(QualibrateCatchExcMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

if (
    _settings.storage_type == StorageType.timeline_db
    and _settings.timeline_db.spawn
):
    if json_timeline_db_app is None:
        raise ImportError(
            "Can't import json_timeline_database instance. "
            "Check that you have installed it."
        )
    app.mount("/timeline_db", json_timeline_db_app, name="json_timeline_db")

# Directory should exist
app.mount(
    "/",
    StaticFiles(directory=_settings.static_site_files, html=True),
    name="static",
)


def main(port: int, reload: bool) -> None:
    uvicorn.run("qualibrate_app.app:app", port=port, reload=reload)


if __name__ == "__main__":
    main(port=8001, reload=False)
