import importlib
import os
from pathlib import Path

import click
from qualibrate_config.vars import DEFAULT_CONFIG_FILENAME, QUALIBRATE_PATH

from qualibrate_composite.config import CONFIG_PATH_ENV_NAME
from qualibrate_composite.config.vars import (
    CORS_ORIGINS_ENV_NAME,
    ROOT_PATH_ENV_NAME,
)


@click.command(name="start")
@click.option(
    "--config-path",
    type=click.Path(
        exists=True,
        file_okay=True,
        dir_okay=True,
        path_type=Path,
    ),
    default=QUALIBRATE_PATH / DEFAULT_CONFIG_FILENAME,
    help="Path to `config.toml` file",
    show_default=True,
)
@click.option(
    "--reload", is_flag=True, hidden=True
)  # env QUALIBRATE_START_RELOAD
@click.option(
    "--port",
    type=int,
    default=8001,
    show_default=True,
    help="Application will be started on the given port",
)  # env QUALIBRATE_START_PORT
@click.option(
    "--host",
    type=str,
    default="127.0.0.1",
    show_default=True,
    help="Application will be started on the given host",
)  # env QUALIBRATE_START_HOST
@click.option(
    "--cors-origin",
    type=str,
    multiple=True,
    help="CORS origin to use. Can be passed multiple times.",
)
@click.option(
    "--root-path",
    type=str,
    default="",
    help=(
        "Optional root path for the application if run as a sub-application."
    ),
)
def start_command(
    config_path: Path,
    port: int,
    host: str,
    reload: bool,
    cors_origin: list[str],
    root_path: str,
) -> None:
    config_path_str = str(config_path)
    os.environ[CONFIG_PATH_ENV_NAME] = config_path_str
    os.environ[ROOT_PATH_ENV_NAME] = root_path
    if len(cors_origin) != 0:
        os.environ[CORS_ORIGINS_ENV_NAME] = ",".join(cors_origin)
    app_config_m = importlib.import_module("qualibrate_app.config")
    if app_config_m and (
        app_config_path_env_name := getattr(
            app_config_m, "CONFIG_PATH_ENV_NAME", None
        )
    ):
        os.environ[app_config_path_env_name] = str(config_path)
    runner_config_m = importlib.import_module("qualibrate_runner.config")
    if runner_config_m and (
        runner_config_path_env_name := getattr(
            runner_config_m, "CONFIG_PATH_ENV_NAME", None
        )
    ):
        os.environ[runner_config_path_env_name] = str(config_path)

    from qualibrate_composite.app import main as app_main

    app_main(port=port, host=host, reload=reload, root_path=root_path)
