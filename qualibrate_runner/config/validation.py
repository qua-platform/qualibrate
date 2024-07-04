from pathlib import Path
from typing import Any, Mapping, Optional

import click
from pydantic import ValidationError

from qualibrate_runner.config.file import read_config_file
from qualibrate_runner.config.models import QualibrateRunnerSettings
from qualibrate_runner.config.vars import CONFIG_KEY

SUGGEST_MSG = (
    "Can't parse existing config. Fix it or overwrite "
    "by default values using `--overwrite` flag."
)


def get_config_solved_references_or_print_error(
    config_path: Path,
) -> Optional[dict[str, Any]]:
    try:
        return read_config_file(config_path, solve_references=True)
    except ValueError as ex:
        click.secho(str(ex), fg="red")
        click.secho(SUGGEST_MSG, fg="yellow")
    return None


def get_config_model_or_print_error(
    config: Mapping[str, Any],
) -> Optional[QualibrateRunnerSettings]:
    try:
        return QualibrateRunnerSettings(**config)
    except ValidationError as ex:
        errors = [
            (
                f"Message: {error.get('msg')}. "
                "Path: "
                f"{'.'.join([CONFIG_KEY, *map(str, error.get('loc', []))])}. "
                f"Value: {error.get('input')}"
            )
            for error in ex.errors()
        ]
        click.secho("\n".join(errors), fg="red")
        click.secho(SUGGEST_MSG, fg="yellow")
    return None
