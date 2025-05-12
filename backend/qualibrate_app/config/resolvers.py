import os
import warnings
from functools import lru_cache
from pathlib import Path
from typing import Annotated, Optional

from fastapi import Depends
from qualibrate_config.models import (
    QualibrateConfig,
)
from qualibrate_config.resolvers import (
    get_qualibrate_config,
    get_qualibrate_config_path,
)

from qualibrate_app.config.vars import (
    CONFIG_PATH_ENV_NAME,
)

__all__ = [
    "get_default_static_files_path",
    "get_config_path",
    "get_settings",
    "get_quam_state_path",
]


def get_default_static_files_path() -> Optional[Path]:
    import sys

    module_file = sys.modules["qualibrate_app"].__file__
    if module_file is None:
        return None
    module_path = Path(module_file)
    return module_path.parents[1] / "qualibrate_static"


@lru_cache
def get_config_path() -> Path:
    path = os.environ.get(CONFIG_PATH_ENV_NAME)
    if path is not None:
        return Path(path)
    return get_qualibrate_config_path()


@lru_cache
def get_settings(
    config_path: Annotated[Path, Depends(get_config_path)],
) -> QualibrateConfig:
    return get_qualibrate_config(config_path)


@lru_cache
def get_quam_state_path(
    settings: Annotated[QualibrateConfig, Depends(get_settings)],
) -> Optional[Path]:
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
