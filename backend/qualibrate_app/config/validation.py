from pathlib import Path
from typing import Any, Mapping, Optional, Type, TypeVar

import click
from pydantic import ValidationError

from qualibrate_app.config import read_config_file
from qualibrate_app.config.models import QualibrateSettingsBase
from qualibrate_app.config.vars import CONFIG_KEY

T = TypeVar("T", bound=QualibrateSettingsBase)


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
    model_type: Type[T],
) -> Optional[T]:
    try:
        return model_type(**config)
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
