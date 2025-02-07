import logging
from importlib.util import find_spec

from fastapi import FastAPI

from qualibrate_composite.api.auth_middleware import (
    QualibrateAppAuthMiddleware,
    RunnerAuthMiddleware,
)
from qualibrate_composite.utils.logging_filter import EndpointFilter


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
    path_prefix = "/dashboards"
    logging.getLogger("uvicorn.access").addFilter(
        EndpointFilter(excluded_endpoints=[path_prefix])
    )
    try:
        from qua_dashboards.app import create_app as qua_dashboard_create_app

        qua_dashboard_app = qua_dashboard_create_app(
            f"{path_prefix.rstrip('/')}/"
        )
    except Exception as ex:
        logging.exception("Can't import qua_dashboards", exc_info=ex)
        return
    from a2wsgi import WSGIMiddleware

    app.mount(
        "/dashboards",
        WSGIMiddleware(qua_dashboard_app.server),  # type: ignore[arg-type]
        name="qua_dashboards",
    )
