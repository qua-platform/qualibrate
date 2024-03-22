import os
import sys
from typing import Any, Mapping

import click
import tomli_w
from pathlib import Path

from click.core import ParameterSource

from qualibrate.config import (
    QualibrateSettingsSetup,
    get_config_file,
    CONFIG_KEY as QUALIBRATE_CONFIG_KEY,
    QUALIBRATE_PATH,
    DEFAULT_CONFIG_FILENAME,
)

if sys.version_info[:2] < (3, 11):
    import tomli as tomllib
else:
    import tomllib
try:
    from json_timeline_database.config import (
        CONFIG_KEY as TIMELINE_DB_CONFIG_KEY,
        Settings as TimelineDbSettings,
        SettingsSetup as TimelineDbSettingsSetup,
        PREDEFINED_DBS,
    )
except ImportError:
    TIMELINE_DB_CONFIG_KEY = None
    TimelineDbSettings = None
    PREDEFINED_DBS = None
    # TODO: replace with smth if timeline DB not installed
    def _settings(**kwargs) -> None:
        pass

    TimelineDbSettingsSetup = _settings


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
    qualibrate_mapping = {k: k for k in ("static_site_files", "user_storage")}
    timeline_db_mapping = {
        "spawn_db": "spawn",
        "timeline_db_address": "address",
        "timeline_db_timeout": "timeout",
        "timeline_db_name": "db_name",
        "timeline_db_metadata_out_path": "metadata_out_path",
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
    return from_file


def _spawn_db_processing(
    ctx: click.Context,
    qualibrate_config: dict[str, Any],
    spawn_db: bool,
    timeline_db_address: str,
) -> dict[str, Any]:
    if spawn_db or qualibrate_config["timeline_db"]["spawn"]:
        click.secho(
            (
                "Argument timeline_db_address replaced because "
                "`spawn_db` is specified"
            ),
            fg="yellow",
        )
        qualibrate_config["timeline_db"][
            "address"
        ] = "http://localhost:8001/timeline_db/"
    if spawn_db is False and not_default(ctx, "spawn_db"):
        click.secho(
            "Uncheck `spawn_db` flag. Use passed timeline db address.",
            fg="yellow",
        )
        qualibrate_config["timeline_db"]["address"] = timeline_db_address
    return qualibrate_config


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


def _get_timeline_db_config() -> TimelineDbSettingsSetup:
    default_config = TimelineDbSettings.schema().get("properties", {})
    return TimelineDbSettingsSetup(
        **{
            k: v.get("default")
            for k, v in default_config.items()
            if k != "predefined_dbs"
        }
    )


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
    "--spawn-db",
    type=bool,
    default=True,
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
# TODO: remove this when multi db will work
@click.option(
    "--timeline-db-name",
    type=str,
    default="new_db",
    show_default=True,
)
@click.option(
    "--timeline-db-metadata-out-path",
    type=str,
    default="data_path",
    show_default=True,
)
@click.pass_context
def config_command(
    ctx: click.Context,
    config_path: Path,
    static_site_files: Path,
    user_storage: Path,
    spawn_db: bool,
    timeline_db_address: str,
    timeline_db_timeout: float,
    timeline_db_name: str,
    timeline_db_metadata_out_path: str,
) -> None:
    common_config, config_file = get_config(config_path)
    qualibrate_config = common_config.get(QUALIBRATE_CONFIG_KEY, {})
    if "timeline_db" not in qualibrate_config:
        qualibrate_config["timeline_db"] = {}

    qualibrate_config = _config_from_sources(ctx, qualibrate_config)
    qualibrate_config = _spawn_db_processing(
        ctx, qualibrate_config, spawn_db, timeline_db_address
    )
    qs = QualibrateSettingsSetup(**qualibrate_config)
    exported_data = qs.model_dump()
    _confirm(config_file, exported_data)

    qs.user_storage.mkdir(parents=True, exist_ok=True)
    if not config_file.parent.exists():
        config_file.parent.mkdir(parents=True)
    common_config[QUALIBRATE_CONFIG_KEY] = exported_data
    if (
        TIMELINE_DB_CONFIG_KEY is not None
        and TIMELINE_DB_CONFIG_KEY not in common_config
    ):
        common_config[
            TIMELINE_DB_CONFIG_KEY
        ] = _get_timeline_db_config().model_dump()
    with config_file.open("wb") as f_out:
        tomli_w.dump(common_config, f_out)
