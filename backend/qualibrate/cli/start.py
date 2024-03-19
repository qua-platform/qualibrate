import os
import click
from pathlib import Path

from qualibrate.config import (
    CONFIG_PATH_ENV_NAME,
    QUALIBRATE_PATH,
    DEFAULT_CONFIG_FILENAME,
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
)
@click.option(
    "--reload", is_flag=True, hidden=True
)  # env QUALIBRATE_START_RELOAD
@click.option("--port", type=int, default=8001)  # env QUALIBRATE_START_PORT
@click.option("--num-workers", type=int, default=1)
def start_command(
    config_path: Path, port: int, num_workers: int, reload: bool
) -> None:
    from qualibrate.app import main as app_main

    os.environ[CONFIG_PATH_ENV_NAME] = str(config_path)
    app_main(port=port, num_workers=num_workers, reload=reload)
