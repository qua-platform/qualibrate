import uvicorn
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from qualibrate_composite.api.routes import base_router
from qualibrate_composite.config import get_config_path, get_settings
from qualibrate_composite.config.resolvers import get_cors_origin
from qualibrate_composite.utils.spawn import (
    spawn_qua_dashboards,
    spawn_qualibrate_app,
    spawn_qualibrate_runner,
)

try:
    from json_timeline_database.app import app as json_timeline_db_app
except ImportError:
    json_timeline_db_app = None


app = FastAPI(title="Qualibrate")
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


def main(port: int, host: str, reload: bool) -> None:
    uvicorn.run(
        "qualibrate_composite.app:app", port=port, host=host, reload=reload
    )


if __name__ == "__main__":
    main(port=8001, host="127.0.0.1", reload=False)
