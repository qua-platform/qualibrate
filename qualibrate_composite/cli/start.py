import importlib
import os
from pathlib import Path

import click
from qualibrate_config import vars as config_vars
from qualibrate_config.cli import config_command

from qualibrate_composite.config import vars as composite_vars


@click.command(name="start")
@click.option(
    "--config-path",
    type=click.Path(
        file_okay=True,
        dir_okay=True,
        path_type=Path,
    ),
    default=config_vars.QUALIBRATE_PATH / config_vars.DEFAULT_CONFIG_FILENAME,
    help="Path to `config.toml` file",
    show_default=True,
)
@click.option("--reload", is_flag=True, hidden=True)  # env QUALIBRATE_START_RELOAD
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
    help=("Optional root path for the application if run as a sub-application."),
)
def start_command(
    config_path: Path,
    port: int,
    host: str,
    reload: bool,
    cors_origin: list[str],
    root_path: str,
) -> None:
    if not config_path.exists() and config_path == config_vars.DEFAULT_CONFIG_FILEPATH:
        click.echo(f"No config found. Auto-creating config at {config_path}")
        config_command(
            ["--config-path", config_path, "--auto-accept"],
            standalone_mode=False,
        )
    config_path_str = str(config_path)

    os.environ.setdefault(config_vars.CONFIG_PATH_ENV_NAME, config_path_str)
    os.environ.setdefault(composite_vars.CONFIG_PATH_ENV_NAME, config_path_str)
    os.environ.setdefault(composite_vars.ROOT_PATH_ENV_NAME, root_path)
    if len(cors_origin) != 0:
        os.environ.setdefault(
            composite_vars.CORS_ORIGINS_ENV_NAME, ",".join(cors_origin)
        )

    def _set_module_env_name_and_value(
        module_path: str,
        *,
        attr_to_set: str = "CONFIG_PATH_ENV_NAME",
        env_value_to_set: str,
    ) -> None:
        module = importlib.import_module(module_path)
        if module and (attr_to_set := getattr(module, attr_to_set)):
            os.environ.setdefault(attr_to_set, env_value_to_set)

    _set_module_env_name_and_value(
        "qualibrate_app.config.vars",
        attr_to_set="CONFIG_PATH_ENV_NAME",
        env_value_to_set=config_path_str,
    )
    _set_module_env_name_and_value(
        "qualibrate_runner.config.vars",
        attr_to_set="CONFIG_PATH_ENV_NAME",
        env_value_to_set=config_path_str,
    )
    _set_module_env_name_and_value(
        "quam.config.vars",
        attr_to_set="CONFIG_PATH_ENV_NAME",
        env_value_to_set=config_path_str,
    )

    from qualibrate_composite.app import main as app_main

    app_main(port=port, host=host, reload=reload, root_path=root_path)
