import os
import sys
from pathlib import Path
from typing import Any, Mapping, Optional

import click
import tomli_w
from click.core import ParameterSource

from qualibrate_app.config import (
    CONFIG_KEY as QUALIBRATE_CONFIG_KEY,
)
from qualibrate_app.config import (
    DEFAULT_CONFIG_FILENAME,
    QUALIBRATE_PATH,
    QualibrateSettingsSetup,
    StorageType,
    get_config_file,
)

if sys.version_info[:2] < (3, 11):
    import tomli as tomllib
else:
    import tomllib


__all__ = ["config_command"]


def not_default(ctx: click.Context, arg_key: str) -> bool:
    return ctx.get_parameter_source(arg_key) in (
        ParameterSource.COMMANDLINE,
        ParameterSource.ENVIRONMENT,
    )


def get_config(config_path: Path) -> tuple[dict[str, Any], Path]:
    """Returns config and path to file"""
    config_file = get_config_file(config_path, raise_not_exists=False)
    if config_file.is_file():
        return tomllib.loads(config_file.read_text()), config_path
    return {}, config_file


def _config_from_sources(
    ctx: click.Context, from_file: dict[str, Any]
) -> dict[str, Any]:
    qualibrate_mapping = {
        k: k
        for k in (
            "static_site_files",
            "user_storage",
            "metadata_out_path",
            "storage_type",
            "project",
        )
    }
    timeline_db_mapping = {
        "timeline_db_address": "address",
        "timeline_db_timeout": "timeout",
    }
    runner_mapping = {
        "runner_address": "address",
        "runner_timeout": "timeout",
    }
    for arg_key, arg_value in ctx.params.items():
        not_default_arg = not_default(ctx, arg_key)
        if arg_key in qualibrate_mapping.keys():
            if not_default_arg or qualibrate_mapping[arg_key] not in from_file:
                from_file[qualibrate_mapping[arg_key]] = arg_value
        elif arg_key in timeline_db_mapping.keys():
            if not_default_arg or (
                timeline_db_mapping[arg_key] not in from_file["timeline_db"]
            ):
                from_file["timeline_db"][
                    timeline_db_mapping[arg_key]
                ] = arg_value
        elif arg_key in runner_mapping.keys():
            if not_default_arg or (
                runner_mapping[arg_key] not in from_file["runner"]
            ):
                from_file["runner"][runner_mapping[arg_key]] = arg_value
    return from_file


def _print_config(data: Mapping[str, Any], depth: int = 0) -> None:
    max_key_len = max(map(len, map(str, data.keys())))
    click.echo(
        os.linesep.join(
            f"{' ' * 4 * depth}{f'{k} :':<{max_key_len + 3}} {v}"
            for k, v in data.items()
            if not isinstance(v, Mapping)
        )
    )
    mappings = filter(lambda x: isinstance(x[1], Mapping), data.items())
    for mapping_k, mapping_v in mappings:
        click.echo(f"{' ' * 4 * depth}{mapping_k} :")
        _print_config(mapping_v, depth + 1)


def _confirm(config_file: Path, exported_data: dict[str, Any]) -> None:
    click.echo(f"Config file path: {config_file}")
    click.echo(click.style("Generated config:", bold=True))
    _print_config(exported_data)
    confirmed = click.confirm("Do you confirm config?", default=True)
    if not confirmed:
        click.echo(
            click.style(
                (
                    "The configuration has not been confirmed. "
                    "Rerun config script."
                ),
                fg="yellow",
            )
        )
        exit(1)


def write_config(
    config_file: Path,
    common_config: dict[str, Any],
    qss: QualibrateSettingsSetup,
    confirm: bool = True,
) -> None:
    exported_data = qss.model_dump()
    if confirm:
        _confirm(config_file, exported_data)
    qss.user_storage.mkdir(parents=True, exist_ok=True)
    if qss.project:
        project_path = qss.user_storage / qss.project
        project_path.mkdir(parents=True, exist_ok=True)
    if not config_file.parent.exists():
        config_file.parent.mkdir(parents=True)
    common_config[QUALIBRATE_CONFIG_KEY] = exported_data
    with config_file.open("wb") as f_out:
        tomli_w.dump(common_config, f_out)


@click.command(name="config")
@click.option(
    "--config-path",
    type=click.Path(
        exists=False,
        path_type=Path,
    ),
    default=QUALIBRATE_PATH / DEFAULT_CONFIG_FILENAME,
    show_default=True,
)
@click.option(
    "--static-site-files",
    type=click.Path(
        exists=True,
        file_okay=False,
        dir_okay=True,
        resolve_path=True,
        path_type=Path,
    ),
    default=Path(__file__).parents[2] / "qualibrate_static",
)
@click.option(
    "--storage-type",
    type=click.Choice([t.value for t in StorageType]),
    default=StorageType.local_storage.value,
    show_default=True,
)
@click.option(
    "--user-storage",
    type=click.Path(
        exists=False,
        resolve_path=True,
        path_type=Path,
    ),
    default=Path().home() / ".qualibrate" / "user_storage",
    help="Path to user storage directory with qualibrate data.",
    show_default=True,
)
@click.option(
    "--project",
    type=str,
    required=False,
)
@click.option(
    "--metadata-out-path",
    type=str,
    default="data_path",
    show_default=True,
)
@click.option(
    "--timeline-db-address",
    type=str,  # TODO: add type check for addr
    default="http://localhost:8000/",
    show_default=True,
)
@click.option(
    "--timeline-db-timeout",
    type=float,
    default=1.0,
    show_default=True,
)
@click.option(
    "--runner-address",
    type=str,  # TODO: add type check for addr
    default="http://localhost:8003/",
    show_default=True,
)
@click.option(
    "--runner-timeout",
    type=float,
    default=1.0,
    show_default=True,
)
@click.pass_context
def config_command(
    ctx: click.Context,
    config_path: Path,
    static_site_files: Path,
    storage_type: StorageType,
    user_storage: Path,
    project: Optional[str],
    metadata_out_path: str,
    timeline_db_address: str,
    timeline_db_timeout: float,
    runner_address: str,
    runner_timeout: float,
) -> None:
    common_config, config_file = get_config(config_path)
    qualibrate_config = common_config.get(QUALIBRATE_CONFIG_KEY, {})
    subconfigs = ("timeline_db", "runner")
    for subconfig in subconfigs:
        if subconfig not in qualibrate_config:
            qualibrate_config[subconfig] = {}
    qualibrate_config = _config_from_sources(ctx, qualibrate_config)
    qss = QualibrateSettingsSetup(**qualibrate_config)
    write_config(config_file, common_config, qss)
