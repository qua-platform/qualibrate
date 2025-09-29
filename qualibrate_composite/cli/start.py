import importlib
import os
from pathlib import Path
from types import ModuleType
from typing import Any

import click
from qualibrate_config import vars as config_vars

from qualibrate_composite.config import vars as composite_vars


@click.command(name="start")
@click.option(
    "--config-path",
    type=click.Path(
        exists=True,
        file_okay=True,
        dir_okay=True,
        path_type=Path,
    ),
    default=config_vars.QUALIBRATE_PATH / config_vars.DEFAULT_CONFIG_FILENAME,
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
    str_port = f"_{port}"

    def _update_module_attr_with_port(
        module: ModuleType, attr_name: str, suffix: str, new_attr_value: Any
    ) -> None:
        new_value = getattr(module, attr_name) + suffix
        setattr(module, attr_name, new_value)
        os.environ[new_value] = new_attr_value

    _update_module_attr_with_port(
        config_vars, "CONFIG_PATH_ENV_NAME", str_port, config_path_str
    )
    _update_module_attr_with_port(
        composite_vars, "CONFIG_PATH_ENV_NAME", str_port, config_path_str
    )
    _update_module_attr_with_port(
        composite_vars, "ROOT_PATH_ENV_NAME", str_port, root_path
    )
    if len(cors_origin) != 0:
        _update_module_attr_with_port(
            composite_vars,
            "CORS_ORIGINS_ENV_NAME",
            str_port,
            ",".join(cors_origin),
        )
    app_config_vars_m = importlib.import_module("qualibrate_app.config.vars")
    if app_config_vars_m and hasattr(app_config_vars_m, "CONFIG_PATH_ENV_NAME"):
        _update_module_attr_with_port(
            app_config_vars_m,
            "CONFIG_PATH_ENV_NAME",
            str_port,
            config_path_str,
        )
    runner_config_vars_m = importlib.import_module(
        "qualibrate_runner.config.vars"
    )
    if runner_config_vars_m and hasattr(
        runner_config_vars_m, "CONFIG_PATH_ENV_NAME"
    ):
        _update_module_attr_with_port(
            runner_config_vars_m,
            "CONFIG_PATH_ENV_NAME",
            str_port,
            config_path_str,
        )

    from qualibrate_composite.app import main as app_main

    app_main(port=port, host=host, reload=reload, root_path=root_path)
