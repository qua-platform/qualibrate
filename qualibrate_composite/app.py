import uvicorn
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from qualibrate_composite.api.auth_middleware import (
    QualibrateAppAuthMiddleware,
    RunnerAuthMiddleware,
)
from qualibrate_composite.api.routes import base_router
from qualibrate_composite.config import get_config_path, get_settings

try:
    from json_timeline_database.app import app as json_timeline_db_app
except ImportError:
    json_timeline_db_app = None


app = FastAPI(title="Qualibrate")
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
app.include_router(base_router)


composite = _settings.composite
if composite is None:
    raise RuntimeError("There is no config for qualibrate composite")
if composite.runner.spawn:
    try:
        from qualibrate_runner.app import app as runner_app
    except ImportError as ex:
        raise ImportError(
            "Can't import qualibrate_runner instance. "
            "Check that you have installed it."
        ) from ex

    runner_app.add_middleware(RunnerAuthMiddleware)
    app.mount("/execution", runner_app, name="qualibrate_runner")

if composite is not None and composite.app.spawn:
    try:
        from qualibrate_app.app import app as qualibrate_app_app
    except ImportError as ex:
        raise ImportError(
            "Can't import qualibrate_app instance. "
            "Check that you have installed it."
        ) from ex

    qualibrate_app_app.add_middleware(QualibrateAppAuthMiddleware)
    app.mount("/", qualibrate_app_app, name="qualibrate_runner")


def main(port: int, host: str, reload: bool) -> None:
    uvicorn.run(
        "qualibrate_composite.app:app", port=port, host=host, reload=reload
    )


if __name__ == "__main__":
    main(port=8001, host="127.0.0.1", reload=False)
