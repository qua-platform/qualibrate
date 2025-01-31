import logging
from importlib.util import find_spec

from fastapi import FastAPI

from qualibrate_composite.api.auth_middleware import (
    QualibrateAppAuthMiddleware,
    RunnerAuthMiddleware,
)


def spawn_qualibrate_runner(app: FastAPI) -> None:
    try:
        from qualibrate_runner.app import app as runner_app
    except ImportError as ex:
        raise ImportError(
            "Can't import qualibrate_runner instance. "
            "Check that you have installed it."
        ) from ex

    runner_app.add_middleware(RunnerAuthMiddleware)
    app.mount("/execution", runner_app, name="qualibrate_runner")


def spawn_qualibrate_app(app: FastAPI) -> None:
    try:
        from qualibrate_app.app import app as qualibrate_app_app
    except ImportError as ex:
        raise ImportError(
            "Can't import qualibrate_app instance. "
            "Check that you have installed it."
        ) from ex

    qualibrate_app_app.add_middleware(QualibrateAppAuthMiddleware)
    app.mount("/", qualibrate_app_app, name="qualibrate_app")


def spawn_qua_dashboards(app: FastAPI) -> None:
    if find_spec("qua_dashboards") is None:
        logging.warning(
            "qua_dashboards is not installed so the dashboards server "
            "is not started"
        )
        return
    try:
        from qua_dashboards.data_visualizer.app import app as qua_dashboard_app
    except Exception as ex:
        logging.exception("Can't import qua_dashboards", exc_info=ex)
    from a2wsgi import WSGIMiddleware

    app.mount("/dashboards", WSGIMiddleware(qua_dashboard_app.server))  # type: ignore[arg-type]
