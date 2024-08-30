import warnings
from copy import deepcopy
from pathlib import Path
from typing import (
    Any,
    Dict,
    Mapping,
    Optional,
    Tuple,
    Type,
    TypeVar,
)

import click
from pydantic import ValidationError

from qualibrate_app.config import read_config_file
from qualibrate_app.config.models.qualibrate import (
    QualibrateSettingsBase,
)
from qualibrate_app.config.models.qualibrate_app import (
    QualibrateAppSettingsBase,
)
from qualibrate_app.config.vars import CONFIG_KEY, QUALIBRATE_CONFIG_KEY

T = TypeVar("T", QualibrateAppSettingsBase, QualibrateSettingsBase)

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


def check_config_pre_v1_and_update(
    common_config: Dict[str, Any], qapp_config: Dict[str, Any]
) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    if "config_version" in qapp_config:
        return common_config[QUALIBRATE_CONFIG_KEY], qapp_config
    warnings.warn(
        UserWarning(
            "You are using old version of config. "
            "Please update to new structure."
        )
    )
    qapp_config = dict(deepcopy(qapp_config))
    qualibrate_config = {
        "storage": {
            "type": qapp_config.pop("storage_type"),
            "location": qapp_config.pop("user_storage").replace(
                f"#/{CONFIG_KEY}/project",
                f"#/{QUALIBRATE_CONFIG_KEY}/project",
            ),
        },
        "project": qapp_config.pop("project"),
        "active_machine": {},
    }
    if "active_machine_path" in qapp_config:
        qualibrate_config[QUALIBRATE_CONFIG_KEY]["active_machine"][
            "path"
        ] = qapp_config.pop("active_machine_path")
    return qualibrate_config, qapp_config


def get_config_model_or_print_error(
    config: Mapping[str, Any],
    model_type: Type[T],
    config_key: str,
) -> Optional[T]:
    try:
        return model_type(**config)
    except ValidationError as ex:
        errors = [
            (
                f"Message: {error.get('msg')}. "
                "Path: "
                f"{'.'.join([config_key, *map(str, error.get('loc', []))])}. "  # type: ignore
                f"Value: {error.get('input')}"
            )
            for error in ex.errors()
        ]
        click.secho("\n".join(errors), fg="red")
        click.secho(SUGGEST_MSG, fg="yellow")
    return None
