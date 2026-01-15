import uvicorn
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from qualibrate_composite.api.routes import base_router
from qualibrate_composite.config import get_config_path, get_settings
from qualibrate_composite.config.resolvers import get_cors_origin, get_root_path
from qualibrate_composite.utils.spawn import (
    app_lifespan,
    spawn_qua_dashboards,
    spawn_qualibrate_app,
    spawn_qualibrate_runner,
    validate_runner_version_for_app,
)

try:
    from json_timeline_database.app import app as json_timeline_db_app
except ImportError:
    json_timeline_db_app = None


app = FastAPI(
    title="Qualibrate", lifespan=app_lifespan, root_path=get_root_path()
)
_settings = get_settings(get_config_path())
cors_origins = get_cors_origin()

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(base_router)


composite = _settings.composite
if composite is None:
    raise RuntimeError("There is no config for qualibrate composite")
if composite.runner.spawn:
    spawn_qualibrate_runner(app)
# TODO: remove hasattr -- needed before release config
if hasattr(composite, "qua_dashboards") and composite.qua_dashboards.spawn:
    spawn_qua_dashboards(app)
if composite.app.spawn:
    spawn_qualibrate_app(app)
if composite.runner.spawn and composite.app.spawn:
    validate_runner_version_for_app()


def main(port: int, host: str, reload: bool, root_path: str = "") -> None:
    uvicorn.run(
        "qualibrate_composite.app:app",
        port=port,
        host=host,
        reload=reload,
        root_path=root_path,
    )


if __name__ == "__main__":
    main(port=8001, host="127.0.0.1", reload=False)
