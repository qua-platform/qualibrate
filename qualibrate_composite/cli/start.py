import os
from pathlib import Path

import click

from qualibrate_composite.config import (
    CONFIG_PATH_ENV_NAME,
    DEFAULT_CONFIG_FILENAME,
    QUALIBRATE_PATH,
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
def start_command(config_path: Path, port: int, reload: bool) -> None:
    from qualibrate_composite.app import main as app_main

    os.environ[CONFIG_PATH_ENV_NAME] = str(config_path)
    app_main(port=port, reload=reload)
