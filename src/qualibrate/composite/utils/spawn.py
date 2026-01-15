import logging
from collections.abc import AsyncIterator
from contextlib import AsyncExitStack, asynccontextmanager
from importlib import metadata
from importlib.util import find_spec

from fastapi import FastAPI
from fastapi.routing import Mount
from packaging.requirements import Requirement
from packaging.version import Version

from qualibrate_composite.api.auth_middleware import (
    QualibrateAppAuthMiddleware,
    RunnerAuthMiddleware,
)
from qualibrate_composite.utils.logging_filter import EndpointFilter

# Frequently polled endpoints that should be filtered from logs
EXECUTION_STATUS_ENDPOINT = "/execution/is_running"
WORKFLOW_STATUS_ENDPOINT = "/execution/last_run/workflow/status"
WORKFLOW_HISTORY_ENDPOINT = "/execution/last_run/workflow/execution_history"
EXECUTION_LAST_RUN_STATUS_ENDPOINT = "/execution/last_run/status"
SNAPSHOTS_HISTORY_ENDPOINT = "/api/branch/main/snapshots_history"
OUTPUT_LOGS_ENDPOINT = "/execution/output_logs"


def spawn_qualibrate_runner(app: FastAPI) -> None:
    try:
        from qualibrate_runner.app import app as runner_app
    except ImportError as ex:
        raise ImportError(
            "Can't import qualibrate_runner instance. "
            "Check that you have installed it."
        ) from ex
    logging.getLogger("uvicorn.access").addFilter(
        EndpointFilter(
            excluded_endpoints_starts=(
                EXECUTION_STATUS_ENDPOINT,
                WORKFLOW_STATUS_ENDPOINT,
                WORKFLOW_HISTORY_ENDPOINT,
                EXECUTION_LAST_RUN_STATUS_ENDPOINT,
                SNAPSHOTS_HISTORY_ENDPOINT,
                OUTPUT_LOGS_ENDPOINT,
            )
        )
    )
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


def validate_runner_version_for_app() -> None:
    existing_version = Version(metadata.version("qualibrate-runner"))
    requirements_str = metadata.requires("qualibrate")
    if requirements_str is None:
        raise RuntimeError("There are no defined qualibrate dependencies.")
    requirements = map(Requirement, requirements_str)
    filtered_runner = filter(
        lambda r: r.name == "qualibrate-runner", requirements
    )
    requirement: Requirement | None = next(filtered_runner, None)
    if requirement is None:
        logging.warning(
            "QUAlibrate-runner version is not recognized. This may be because "
            "the package was installed in editable mode. Cannot verify that "
            "version match."
        )
        return
    requirement_version_lst = list(iter(requirement.specifier))
    if (
        len(requirement_version_lst) != 1
        or not requirement_version_lst[0].operator == "=="
    ):
        raise RuntimeError(
            "Invalid required qualibrate-runner version format. "
            f"Your: {requirement.specifier}. "
            "Expected '==X.Y.Z'."
        )
    dep_version = Version(requirement_version_lst[0].version)
    if (
        existing_version.major == dep_version.major
        and existing_version.minor == dep_version.minor
        and existing_version.micro >= dep_version.micro
    ):
        return
    max_version = Version(f"{dep_version.major}.{dep_version.minor + 1}.0")
    raise RuntimeError(
        f"Invalid qualibrate-runner version. Expected: '=={dep_version}'. "
        f"Allowed: '>={dep_version}, <{max_version}'. "
        f"Installed: {existing_version}. Please run "
        "'pip install --upgrade qualibrate' to ensure version compatibility."
    )


def spawn_qua_dashboards(app: FastAPI) -> None:
    if find_spec("qua_dashboards") is None:
        logging.warning(
            "qua_dashboards is not installed so the dashboards server "
            "is not started"
        )
        return
    path_prefix = app.root_path + "/dashboards"
    logging.getLogger("uvicorn.access").addFilter(
        EndpointFilter(excluded_endpoints_starts=(path_prefix,))
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


@asynccontextmanager
async def app_lifespan(app: FastAPI) -> AsyncIterator[None]:
    async with AsyncExitStack() as stack:
        for route in filter(
            lambda r: isinstance(r, Mount) and isinstance(r.app, FastAPI),
            app.routes,
        ):
            await stack.enter_async_context(
                route.app.router.lifespan_context(app)  # type: ignore[attr-defined]
            )
        yield
