import os
from pathlib import Path

import click
from qualibrate_config.vars import DEFAULT_CONFIG_FILENAME, QUALIBRATE_PATH

from qualibrate.runner.config import CONFIG_PATH_ENV_NAME


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
)
@click.option("--reload", is_flag=True, hidden=True)  # env QUALIBRATE_RUNNER_START_RELOAD
@click.option("--port", type=int, default=8003)  # env QUALIBRATE_RUNNER_START_PORT
@click.option(
    "--log-level",
    type=str,
    default="info",
    show_default=True,
    help="Log level for console output (debug, info, warning, error, critical)",
)
def start_command(config_path: Path, port: int, reload: bool, log_level: str) -> None:
    os.environ[CONFIG_PATH_ENV_NAME] = str(config_path)

    from qualibrate.runner.app import main as app_main

    app_main(port=port, reload=reload, log_level=log_level)
