import os
from pathlib import Path

import click
from qualibrate_config.vars import (
    DEFAULT_CONFIG_FILENAME,
    QUALIBRATE_PATH,
)

from qualibrate_app.config import CONFIG_PATH_ENV_NAME


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
def start_command(config_path: Path, port: int, reload: bool) -> None:
    os.environ[CONFIG_PATH_ENV_NAME] = str(config_path)

    from qualibrate_app.app import main as app_main

    app_main(port=port, reload=reload)
