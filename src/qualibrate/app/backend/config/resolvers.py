import os
import warnings
from functools import lru_cache
from pathlib import Path
from typing import Annotated

from fastapi import Depends
from qualibrate_config.file import get_config_file
from qualibrate_config.models import (
    QualibrateConfig,
)
from qualibrate_config.resolvers import get_qualibrate_config

from qualibrate_app.config import vars as config_vars

__all__ = [
    "get_default_static_files_path",
    "get_config_path",
    "get_settings",
    "get_quam_state_path",
]


def get_default_static_files_path() -> Path | None:
    import sys

    module_file = sys.modules["qualibrate_app"].__file__
    if module_file is None:
        return None
    module_path = Path(module_file)
    return module_path.parents[1] / "qualibrate_static"


@lru_cache
def get_config_path() -> Path:
    return get_config_file(
        config_path=os.environ.get(config_vars.CONFIG_PATH_ENV_NAME),
        default_config_specific_filename=(
            config_vars.DEFAULT_QUALIBRATE_APP_CONFIG_FILENAME
        ),
        raise_not_exists=True,
    )


@lru_cache
def get_settings(
    config_path: Annotated[Path, Depends(get_config_path)],
) -> QualibrateConfig:
    return get_qualibrate_config(config_path)


@lru_cache
def get_quam_state_path(
    settings: Annotated[QualibrateConfig, Depends(get_settings)],
) -> Path | None:
    root = settings.__class__._root
    if root is None:
        return None
    quam_state_path = root._raw_dict.get("quam", {}).get("state_path")
    if quam_state_path is not None:
        return Path(quam_state_path)
    active_machine_path = root._raw_dict.get("active_machine", {}).get("path")
    if active_machine_path is None:
        return None
    warnings.warn(
        (
            'The config entry "active_machine.path" has been deprecated in '
            'favor of "quam.state_path". Please update the qualibrate config '
            "(~/.qualibrate/config.toml) accordingly."
        ),
        DeprecationWarning,
        stacklevel=2,
    )
    return Path(active_machine_path)
