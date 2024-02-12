import os
import click
from pathlib import Path

from qualibrate.config import CONFIG_PATH_ENV_NAME, DEFAULT_CONFIG_PATH


@click.command(name="start")
@click.option(
    "--config-file",
    type=click.Path(
        exists=True,
        file_okay=True,
        dir_okay=False,
        path_type=Path,
    ),
    default=DEFAULT_CONFIG_PATH,
)
@click.option(
    "--reload", is_flag=True, hidden=True
)  # env QUALIBRATE_START_RELOAD
def start_command(config_file: Path, reload: bool) -> None:
    from qualibrate.app import main as app_main

    os.environ[CONFIG_PATH_ENV_NAME] = str(config_file)
    app_main(reload)
