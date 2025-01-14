import os
from pathlib import Path

import click
from qualibrate_config.vars import DEFAULT_CONFIG_FILENAME, QUALIBRATE_PATH

from qualibrate_composite.config import CONFIG_PATH_ENV_NAME

try:
    from qualibrate_app.config import (
        CONFIG_PATH_ENV_NAME as QAPP_CONFIG_PATH_ENV_NAME,
    )
except ImportError:
    QAPP_CONFIG_PATH_ENV_NAME = None
try:
    from qualibrate_runner.config import (
        CONFIG_PATH_ENV_NAME as RUNNER_CONFIG_PATH_ENV_NAME,
    )
except ImportError:
    RUNNER_CONFIG_PATH_ENV_NAME = None


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
def start_command(
    config_path: Path, port: int, host: str, reload: bool
) -> None:
    config_path_str = str(config_path)
    os.environ[CONFIG_PATH_ENV_NAME] = config_path_str
    if QAPP_CONFIG_PATH_ENV_NAME is not None:
        os.environ[QAPP_CONFIG_PATH_ENV_NAME] = str(config_path)
    if RUNNER_CONFIG_PATH_ENV_NAME is not None:
        os.environ[RUNNER_CONFIG_PATH_ENV_NAME] = str(config_path)

    from qualibrate_composite.app import main as app_main

    app_main(port=port, host=host, reload=reload)
