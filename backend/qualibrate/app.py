import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware

from qualibrate.api.__main__ import api_router
from qualibrate.api.exceptions.middleware import QualibrateCatchExcMiddleware
from qualibrate.config import get_settings

try:
    from json_timeline_database.app import app as json_timeline_db_app
except ImportError:
    json_timeline_db_app = None


app = FastAPI(title="Qualibrate")
_settings = get_settings()

origins = ["http://localhost:8002", "http://localhost:8001"]

app.add_middleware(QualibrateCatchExcMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/json_db")

if _settings.timeline_db.spawn:
    if json_timeline_db_app is None:
        raise ImportError(
            "Can't import json_timeline_database instance. "
            "Check that you have installed it."
        )
    app.mount("/json_db", json_timeline_db_app, name="json_timeline_db")

# Directory should exist
app.mount(
    "/",
    StaticFiles(directory=_settings.static_site_files, html=True),
    name="static",
)


def main(port: int, num_workers: int, reload: bool) -> None:
    uvicorn.run(
        "qualibrate.app:app", port=port, workers=num_workers, reload=reload
    )


if __name__ == "__main__":
    main(port=8001, num_workers=1, reload=False)
