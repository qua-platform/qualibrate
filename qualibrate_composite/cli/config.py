import os
import sys
from collections.abc import Mapping
from importlib.util import find_spec
from itertools import filterfalse
from pathlib import Path
from typing import Any, Optional

import click
import tomli_w
from click.core import ParameterSource

from qualibrate_composite.config import (
    CONFIG_KEY as QUALIBRATE_CONFIG_KEY,
)
from qualibrate_composite.config import (
    DEFAULT_CONFIG_FILENAME,
    QUALIBRATE_PATH,
    QualibrateSettings,
    get_config_file,
)
from qualibrate_composite.config.references.resolvers import resolve_references

if sys.version_info[:2] < (3, 11):
    import tomli as tomllib
else:
    import tomllib

try:
    qualibrate_app = find_spec("qualibrate_app")
    from qualibrate_app.config import (
        ACTIVE_MACHINE_CONFIG_KEY as QAPP_AM_CONFIG_KEY,
    )
    from qualibrate_app.config import (
        CONFIG_KEY as QAPP_CONFIG_KEY,
    )
    from qualibrate_app.config import QUALIBRATE_CONFIG_KEY as QAPP_Q_CONFIG_KEY
    from qualibrate_app.config import (
        ActiveMachineSettingsSetup,
        QualibrateAppSettingsSetup,
        StorageType,
    )
    from qualibrate_app.config import (
        QualibrateSettingsSetup as QualibrateAppQSettingsSetup,
    )
except ImportError:
    QAPP_CONFIG_KEY = None
    QAPP_Q_CONFIG_KEY = None
    QAPP_AM_CONFIG_KEY = None

    from qualibrate_composite.cli._sub_configs import (
        ActiveMachineSettingsSetup,
        QualibrateAppQSettingsSetup,
        QualibrateAppSettingsSetup,
        StorageType,
    )
try:
    qualibrate = find_spec("qualibrate")

    from qualibrate_runner.config import (
        CONFIG_KEY as RUNNER_CONFIG_KEY,
    )
    from qualibrate_runner.config import QualibrateRunnerSettings
except ImportError:
    RUNNER_CONFIG_KEY = None

    from qualibrate_composite.cli._sub_configs import (
        QualibrateRunnerSettings,
    )

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


def _qualibrate_config_from_sources(
    ctx: click.Context, from_file: dict[str, Any]
) -> dict[str, Any]:
    qualibrate_composite_mapping = {"qualibrate_password": "password"}
    qualibrate_app_mapping = {
        "spawn_app": "spawn",
    }
    timeline_db_mapping = {
        "spawn_db": "spawn",
        "timeline_db_address": "address",
        "timeline_db_timeout": "timeout",
    }
    runner_mapping = {
        "spawn_runner": "spawn",
        "runner_address": "address",
        "runner_timeout": "timeout",
    }
    for arg_key, arg_value in ctx.params.items():
        not_default_arg = not_default(ctx, arg_key)
        if arg_key in qualibrate_composite_mapping:
            if not_default_arg or (
                qualibrate_composite_mapping[arg_key] not in from_file
            ):
                from_file[qualibrate_composite_mapping[arg_key]] = arg_value
        elif arg_key in qualibrate_app_mapping:
            if not_default_arg or (
                qualibrate_app_mapping[arg_key] not in from_file["app"]
            ):
                from_file["app"][qualibrate_app_mapping[arg_key]] = arg_value
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
    if not len(data.keys()):
        return
    max_key_len = max(map(len, map(str, data.keys())))
    non_mapping_items = list(
        filterfalse(lambda item: isinstance(item[1], Mapping), data.items())
    )
    if len(non_mapping_items):
        click.echo(
            os.linesep.join(
                f"{' ' * 4 * depth}{f'{k} :':<{max_key_len + 3}} {v}"
                for k, v in non_mapping_items
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


def _get_runner_config(
    ctx: click.Context, from_file: dict[str, Any]
) -> QualibrateRunnerSettings:
    if qualibrate is None:
        raise ImportError("Qualibrate is not installed")
    args_mapping = {
        "runner_calibration_library_resolver": "calibration_library_resolver",
        "runner_calibration_library_folder": "calibration_library_folder",
    }
    for arg_key, arg_value in ctx.params.items():
        if arg_key not in args_mapping:
            continue
        not_default_resolver_arg = not_default(ctx, arg_key)
        if not_default_resolver_arg or args_mapping[arg_key] not in from_file:
            from_file[args_mapping[arg_key]] = arg_value
    Path(from_file["calibration_library_folder"]).mkdir(
        parents=True, exist_ok=True
    )
    return QualibrateRunnerSettings(**from_file)


def _get_qapp_config(
    ctx: click.Context, qs: QualibrateSettings, from_file: dict[str, Any]
) -> QualibrateAppSettingsSetup:
    args_mapping = {
        "app_static_site_files": "static_site_files",
        "app_metadata_out_path": "metadata_out_path",
    }
    data = {
        config_key: from_file.get(config_key)
        for config_key in args_mapping.values()
    }
    for arg_key, arg_value in ctx.params.items():
        if arg_key not in args_mapping:
            continue
        not_default_resolver_arg = not_default(ctx, arg_key)
        if not_default_resolver_arg or args_mapping[arg_key] not in from_file:
            data[args_mapping[arg_key]] = arg_value
    return QualibrateAppSettingsSetup(
        **data,
        timeline_db={
            "address": "http://localhost:8000",
            "timeout": 1,
        },
        runner={
            "address": qs.runner.address,
            "timeout": qs.runner.timeout,
        },
    )


def _get_qapp_am_config(
    ctx: click.Context, from_file: dict[str, Any]
) -> ActiveMachineSettingsSetup:
    args_mapping = {"active_machine_path": "path"}
    data = {
        config_key: from_file.get(config_key)
        for config_key in args_mapping.values()
    }
    for arg_key, arg_value in filter(
        lambda item: item[0] in args_mapping, ctx.params.items()
    ):
        not_default_resolver_arg = not_default(ctx, arg_key)
        if not_default_resolver_arg or args_mapping[arg_key] not in from_file:
            data[args_mapping[arg_key]] = arg_value
    return ActiveMachineSettingsSetup(**data)


def _get_qapp_q_config(
    ctx: click.Context, from_file: dict[str, Any]
) -> QualibrateAppQSettingsSetup:
    storage_keys = {
        "app_storage_type": "type",
        "app_user_storage": "location",
    }
    common_keys = {
        "app_project": "project",
        "log_folder": "log_folder",
    }
    for key in ("storage",):
        if key not in from_file:
            from_file[key] = {}
    for arg_key, arg_value in ctx.params.items():
        if arg_key in storage_keys:
            not_default_resolver_arg = not_default(ctx, arg_key)
            if (
                not_default_resolver_arg
                or storage_keys[arg_key] not in from_file["storage"]
            ):
                from_file["storage"][storage_keys[arg_key]] = arg_value
        if arg_key in common_keys:
            not_default_resolver_arg = not_default(ctx, arg_key)
            if (
                not_default_resolver_arg
                or common_keys[arg_key] not in from_file
            ):
                from_file[common_keys[arg_key]] = arg_value
    return QualibrateAppQSettingsSetup(**from_file)


def reorder_common_config_entries(data: dict[str, Any]) -> dict[str, Any]:
    sorted_keys = (
        QAPP_Q_CONFIG_KEY,
        QUALIBRATE_CONFIG_KEY,
        QAPP_CONFIG_KEY,
        RUNNER_CONFIG_KEY,
        QAPP_AM_CONFIG_KEY,
    )
    return {
        **{key: data[key] for key in sorted_keys if key in data},
        **{k: v for k, v in data.items() if k not in sorted_keys},
    }


def write_config(
    config_file: Path,
    common_config: dict[str, Any],
    qs: QualibrateSettings,
    confirm: bool = True,
) -> None:
    exported_data = qs.model_dump(mode="json", exclude_none=True)
    common_config[QUALIBRATE_CONFIG_KEY] = exported_data
    common_config = reorder_common_config_entries(common_config)
    if confirm:
        _confirm(config_file, common_config)
    storage = common_config.get(QAPP_Q_CONFIG_KEY, {}).get("storage", {})
    if "location" in storage:
        config_with_resolved_refs = resolve_references(common_config)
        qapp_q_conf = config_with_resolved_refs[QAPP_Q_CONFIG_KEY]
        user_storage = qapp_q_conf["storage"]["location"]
        user_storage_path = Path(user_storage)
        user_storage_path.mkdir(parents=True, exist_ok=True)
        project = qapp_q_conf.get("project")
        if project is not None and project not in user_storage_path.parts:
            project_path = user_storage_path / project
            project_path.mkdir(parents=True, exist_ok=True)
    if not config_file.parent.exists():
        config_file.parent.mkdir(parents=True)
    with config_file.open("wb") as f_out:
        tomli_w.dump(common_config, f_out)


def _get_calibrations_path() -> Path:
    return QUALIBRATE_PATH / "calibrations"


def _get_qapp_static_file_path() -> Path:
    if qualibrate_app is not None and qualibrate_app.origin is not None:
        return Path(qualibrate_app.origin).parents[1] / "qualibrate_static"
    static = QUALIBRATE_PATH / "qualibrate_static"
    static.mkdir(parents=True, exist_ok=True)
    return static


def _get_user_storage() -> Path:
    return QUALIBRATE_PATH.joinpath(
        "user_storage", f"${{#/{QAPP_Q_CONFIG_KEY}/project}}"
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
    help=(
        "Path to the configuration file. If the path points to a file, it will "
        "be read and the old configuration will be reused, except for the "
        "variables specified by the user. If the file does not exist, a new one"
        " will be created. If the path points to a directory, a check will be "
        "made to see if files with the default name exist."
    ),
)
@click.option(
    "--auto-accept",
    type=bool,
    is_flag=True,
    default=False,
    show_default=True,
    help=(
        "Flag responsible for whether to skip confirmation of the generated "
        "config."
    ),
)
@click.option(
    "--qualibrate-password",
    type=str,
    default=None,
    help=(
        "Password used to authorize users. By default, no password is used. "
        "Everyone has access to the API. If a password is specified during "
        "configuration, you must log in to access the API."
    ),
)
@click.option(
    "--spawn-runner",
    type=bool,  # TODO: add type check for addr
    default=True,
    show_default=True,
    help=(
        "This flag indicates whether the `qualibrate-runner` service should be "
        "started. This service is designed to run nodes and graphs. The service"
        " can be spawned independently."
    ),
)
@click.option(
    "--runner-address",
    type=str,  # TODO: add type check for addr
    default="http://localhost:8001/execution/",
    show_default=True,
    help=(
        "Address of `qualibrate-runner` service. If the service is spawned by "
        "the `qualibrate` then the default address should be kept as is. If you"
        " are running the service separately, you must specify its address."
    ),
)
@click.option(
    "--runner-timeout",
    type=float,
    default=1.0,
    show_default=True,
    help=(
        "Maximum waiting time for a response from the `qualibrate-runner` "
        "service."
    ),
)
@click.option(
    "--runner-calibration-library-resolver",
    type=str,
    default="qualibrate.QualibrationLibrary",
    show_default=True,
    help=(
        "String contains python path to the class that represents qualibration "
        "library."
    ),
)
@click.option(
    "--runner-calibration-library-folder",
    type=click.Path(file_okay=False, dir_okay=True),
    default=_get_calibrations_path(),
    show_default=True,
    help="Path to the folder contains calibration nodes and graphs.",
)
@click.option(
    "--spawn-app",
    type=bool,
    default=True,
    show_default=True,
    help=(
        "This flag indicates whether the `qualibrate-app` service should be "
        "started. This service is designed to getting info about snapshots. "
        "The service can be spawned independently."
    ),
)
@click.option(
    "--app-static-site-files",
    type=click.Path(file_okay=False, dir_okay=True),
    default=_get_qapp_static_file_path(),
    show_default=True,
    help="Path to the frontend build static files.",
)
@click.option(
    "--app-storage-type",
    type=click.Choice([t.value for t in StorageType]),
    default="local_storage",
    show_default=True,
    callback=lambda ctx, param, value: StorageType(value),
    help=(
        "Type of storage. Only `local_storage` is supported now. Use specified "
        "local path as the database."
    ),
)
@click.option(
    "--app-user-storage",
    type=click.Path(file_okay=False, dir_okay=True),
    default=_get_user_storage(),
    show_default=True,
    help=(
        "Path to the local user storage. Used for storing nodes output data."
    ),
)
@click.option(
    "--app-project",
    type=str,
    default="init_project",
    show_default=True,
    help=(
        "The name of qualibrate app project that will be used for storing runs "
        "results and resolving them."
    ),
)
@click.option(
    "--app-metadata-out-path",
    type=str,
    default="data_path",
    show_default=True,
    help=(
        "Key of metadata that's used for resolving path where a node results "
        "should be stored to or resolved from."
    ),
)
@click.option(
    "--active-machine-path",
    type=click.Path(file_okay=False, dir_okay=True),
    default=None,
    show_default=True,
    help=(
        "The path to the directory where the active machine state should be "
        "stored."
    ),
)
@click.option(
    "--log-folder",
    type=click.Path(file_okay=False, resolve_path=True, path_type=Path),
    default=QUALIBRATE_PATH / "logs",
    help="The path to the directory where the logs should be stored to.",
    show_default=True,
)
@click.pass_context
def config_command(
    ctx: click.Context,
    config_path: Path,
    auto_accept: bool,
    qualibrate_password: Optional[str],
    spawn_app: bool,
    spawn_runner: bool,
    runner_address: str,
    runner_timeout: float,
    runner_calibration_library_resolver: str,
    runner_calibration_library_folder: Path,
    app_static_site_files: Path,
    app_storage_type: StorageType,
    app_user_storage: Path,
    app_project: str,
    app_metadata_out_path: str,
    active_machine_path: Path,
    log_folder: Path,
) -> None:
    common_config, config_file = get_config(config_path)
    qualibrate_config = common_config.get(QUALIBRATE_CONFIG_KEY, {})
    subconfigs = ("app", "timeline_db", "runner")
    for subconfig in subconfigs:
        if subconfig not in qualibrate_config:
            qualibrate_config[subconfig] = {}
    qualibrate_config = _qualibrate_config_from_sources(ctx, qualibrate_config)
    qs = QualibrateSettings(**qualibrate_config)
    if RUNNER_CONFIG_KEY is not None:
        common_config[RUNNER_CONFIG_KEY] = _get_runner_config(
            ctx, common_config.get(RUNNER_CONFIG_KEY, {})
        ).model_dump(
            mode="json",
            exclude_none=True,
        )
    if QAPP_CONFIG_KEY is not None:
        common_config[QAPP_CONFIG_KEY] = _get_qapp_config(
            ctx, qs, common_config.get(QAPP_CONFIG_KEY, {})
        ).model_dump(
            mode="json",
            exclude_none=True,
        )
    if QAPP_Q_CONFIG_KEY is not None:
        common_config[QAPP_Q_CONFIG_KEY] = _get_qapp_q_config(
            ctx, common_config.get(QAPP_Q_CONFIG_KEY, {})
        ).model_dump(
            mode="json",
            exclude_none=True,
        )
    if QAPP_AM_CONFIG_KEY is not None:
        common_config[QAPP_AM_CONFIG_KEY] = _get_qapp_am_config(
            ctx, common_config.get(QAPP_AM_CONFIG_KEY, {})
        ).model_dump(
            mode="json",
            exclude_none=True,
        )
    write_config(config_file, common_config, qs, confirm=not auto_accept)
