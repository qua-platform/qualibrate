import os
import sys
from collections.abc import Mapping
from pathlib import Path
from typing import Any

import click
from click.core import ParameterSource
from qualibrate_config.resolvers import get_qualibrate_config_path

if sys.version_info[:2] < (3, 11):
    import tomli as tomllib
else:
    import tomllib


# __all__ = ["config_command"]


def not_default(ctx: click.Context, arg_key: str) -> bool:
    return ctx.get_parameter_source(arg_key) in (
        ParameterSource.COMMANDLINE,
        ParameterSource.ENVIRONMENT,
    )


def get_config(config_path: Path) -> tuple[dict[str, Any], Path]:
    """Returns config and path to file"""
    config_file = get_qualibrate_config_path()
    if config_file.is_file():
        return tomllib.loads(config_file.read_text()), config_path
    return {}, config_file


def _config_from_sources(
    ctx: click.Context, from_file: dict[str, Any]
) -> dict[str, Any]:
    qualibrate_mapping = {k: k for k in ("static_site_files",)}
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
        if arg_key in qualibrate_mapping:
            if not_default_arg or qualibrate_mapping[arg_key] not in from_file:
                from_file[qualibrate_mapping[arg_key]] = arg_value
        elif arg_key in timeline_db_mapping:
            if not_default_arg or (
                timeline_db_mapping[arg_key] not in from_file["timeline_db"]
            ):
                from_file["timeline_db"][timeline_db_mapping[arg_key]] = (
                    arg_value
                )
        elif arg_key in runner_mapping and (
            not_default_arg
            or (runner_mapping[arg_key] not in from_file["runner"])
        ):
            from_file["runner"][runner_mapping[arg_key]] = arg_value
    return from_file


def _print_config(data: Mapping[str, Any], depth: int = 0) -> None:
    try:
        max_key_len = max(map(len, map(str, data.keys())))
    except ValueError:
        max_key_len = 1
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


def _confirm(
    config_file: Path,
    qs_data: Mapping[str, Any],
    am_data: Mapping[str, Any],
    qas_data: Mapping[str, Any],
) -> None:
    click.echo(f"Config file path: {config_file}")
    click.echo(click.style("Generated config:", bold=True))
    _print_config(
        {
            "Qualibrate": qs_data,
            "Qualibrate app": qas_data,
            "Active machine": am_data,
        }
    )
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


# def write_config(
#     config_file: Path,
#     common_config: dict[str, Any],
#     qss: QualibrateSettingsSetup,
#     ams: ActiveMachineSettingsSetup,
#     qass: QualibrateAppSettingsSetup,
#     confirm: bool = True,
# ) -> None:
#     qs_exported_data = qss.model_dump(exclude_none=True)
#     am_exported_data = ams.model_dump(exclude_none=True)
#     qas_exported_data = qass.model_dump()
#     if confirm:
#         _confirm(
#             config_file, qs_exported_data, am_exported_data, qas_exported_data
#         )
#     storage_location = cast(Path, qss.storage.location)
#     storage_location.mkdir(parents=True, exist_ok=True)
#     if qss.project:
#         project_path = storage_location / qss.project
#         project_path.mkdir(parents=True, exist_ok=True)
#     if qss.log_folder:
#         cast(Path, qss.log_folder).mkdir(parents=True, exist_ok=True)
#     if not config_file.parent.exists():
#         config_file.parent.mkdir(parents=True)
#     common_config[CONFIG_KEY] = qas_exported_data
#     common_config[ACTIVE_MACHINE_CONFIG_KEY] = am_exported_data
#     common_config[QUALIBRATE_CONFIG_KEY] = qs_exported_data
#
#     with config_file.open("wb") as f_out:
#         tomli_w.dump(common_config, f_out)
#
#
# @click.command(name="config")
# @click.option(
#     "--config-path",
#     type=click.Path(
#         exists=False,
#         path_type=Path,
#     ),
#     default=QUALIBRATE_PATH / DEFAULT_CONFIG_FILENAME,
#     show_default=True,
# )
# @click.option(
#     "--auto-accept",
#     type=bool,
#     is_flag=True,
#     default=False,
#     show_default=True,
# )
# @click.option(
#     "--overwrite",
#     type=bool,
#     default=False,
#     is_flag=True,
#     help="Ignore existing config and force overwrite values",
# )
# @click.option(
#     "--static-site-files",
#     type=click.Path(
#         exists=True,
#         file_okay=False,
#         dir_okay=True,
#         resolve_path=True,
#         path_type=Path,
#     ),
#     default=Path(__file__).parents[2] / "qualibrate_static",
# )
# @click.option(
#     "--storage-type",
#     type=click.Choice([t.value for t in StorageType]),
#     default=StorageType.local_storage.value,
#     show_default=True,
# )
# @click.option(
#     "--user-storage",
#     type=click.Path(
#         exists=False,
#         resolve_path=True,
#         path_type=Path,
#     ),
#     default=QUALIBRATE_PATH / "user_storage",
#     help="Path to user storage directory with qualibrate data.",
#     show_default=True,
# )
# @click.option(
#     "--project",
#     type=str,
#     required=False,
# )
# @click.option(
#     "--timeline-db-address",
#     type=str,  # TODO: add type check for addr
#     default="http://localhost:8000/",
#     show_default=True,
# )
# @click.option(
#     "--timeline-db-timeout",
#     type=float,
#     default=1.0,
#     show_default=True,
# )
# @click.option(
#     "--runner-address",
#     type=str,  # TODO: add type check for addr
#     default="http://localhost:8001/execution/",
#     show_default=True,
# )
# @click.option(
#     "--runner-timeout",
#     type=float,
#     default=1.0,
#     show_default=True,
# )
# @click.pass_context
# def config_command(
#     ctx: click.Context,
#     config_path: Path,
#     auto_accept: bool,
#     overwrite: bool,
#     static_site_files: Path,
#     storage_type: StorageType,
#     log_path: Path,
#     user_storage: Path,
#     project: Optional[str],
#     timeline_db_address: str,
#     timeline_db_timeout: float,
#     runner_address: str,
#     runner_timeout: float,
# ) -> None:
#     common_config, config_file = get_config(config_path)
#     qualibrate_app_config = (
#         common_config.get(CONFIG_KEY, {}) if not overwrite else {}
#     )
#     qapp_subconfigs = ("timeline_db", "runner")
#     for subconfig in qapp_subconfigs:
#         if subconfig not in qualibrate_app_config:
#             qualibrate_app_config[subconfig] = {}
#
#     qualibrate_app_config = _config_from_sources(ctx, qualibrate_app_config)
#     (
#         qualibrate_config,
#         active_machine_config,
#         qapp_config,
#     ) = check_config_pre_v1_and_update(common_config, qualibrate_app_config)
#     qss = get_config_model_or_print_error(
#         qualibrate_config, QualibrateSettingsSetup, QUALIBRATE_CONFIG_KEY
#     )
#     ams = get_config_model_or_print_error(
#         active_machine_config,
#         ActiveMachineSettingsSetup,
#         ACTIVE_MACHINE_CONFIG_KEY,
#     )
#     qass = get_config_model_or_print_error(
#         qapp_config, QualibrateAppSettingsSetup, CONFIG_KEY
#     )
#     if qss is None or ams is None or qass is None:
#         return
#     write_config(
#         config_file,
#         common_config,
#         qss,
#         ams,
#         qass,
#         confirm=not auto_accept,
#     )
