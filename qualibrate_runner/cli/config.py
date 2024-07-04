import os
import sys
from pathlib import Path
from typing import Any, Mapping

import click
import tomli_w
from click.core import ParameterSource

from qualibrate_runner.config import (
    CONFIG_KEY as QUALIBRATE_RUNNER_CONFIG_KEY,
)
from qualibrate_runner.config import (
    DEFAULT_CONFIG_FILENAME,
    QUALIBRATE_PATH,
    QualibrateRunnerSettings,
    get_config_file,
)
from qualibrate_runner.config.validation import get_config_model_or_print_error

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
    config_keys = QualibrateRunnerSettings.model_fields.keys()
    runner_mapping: dict[str, str] = {k: k for k in config_keys}
    for arg_key, arg_value in ctx.params.items():
        not_default_arg = not_default(ctx, arg_key)
        if arg_key in runner_mapping.keys():
            if not_default_arg or runner_mapping[arg_key] not in from_file:
                from_file[runner_mapping[arg_key]] = arg_value
    return from_file


def write_config(
    config_file: Path,
    common_config: dict[str, Any],
    qrs: QualibrateRunnerSettings,
    confirm: bool = True,
) -> None:
    exported_data = qrs.model_dump(mode="json")
    if confirm:
        _confirm(config_file, exported_data)
    if not config_file.parent.exists():
        config_file.parent.mkdir(parents=True)
    common_config[QUALIBRATE_RUNNER_CONFIG_KEY] = exported_data
    with config_file.open("wb") as f_out:
        tomli_w.dump(common_config, f_out)


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
    "--overwrite",
    type=bool,
    default=False,
    is_flag=True,
    help="Ignore existing config and force overwrite values"
)
@click.option(
    "--calibration-library-resolver",
    type=click.STRING,
    default="qualibrate.QualibrationLibrary",
)
@click.option(
    "--calibration-library-folder",
    type=click.Path(exists=True, file_okay=False, dir_okay=True),
    required=True,
)
@click.pass_context
def config_command(
    ctx: click.Context,
    config_path: Path,
    overwrite: bool,
    calibration_library_resolver: str,
    calibration_library_folder: Path,
) -> None:
    common_config, config_file = get_config(config_path)
    runner_config = (
        common_config.get(QUALIBRATE_RUNNER_CONFIG_KEY, {})
        if not overwrite
        else {}
    )
    runner_config = _config_from_sources(ctx, runner_config)

    qrs = get_config_model_or_print_error(runner_config)
    if qrs is None:
        return
    write_config(config_file, common_config, qrs)
