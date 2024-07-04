import os
from functools import lru_cache
from pathlib import Path
from typing import Annotated

from fastapi import Depends

from qualibrate_runner.config.file import get_config_file
from qualibrate_runner.config.models import QualibrateRunnerSettings
from qualibrate_runner.config.validation import (
    get_config_model_or_print_error,
    get_config_solved_references_or_print_error,
)
from qualibrate_runner.config.vars import (
    CONFIG_KEY,
    CONFIG_PATH_ENV_NAME,
)


__all__ = [
    "get_config_path",
    "get_settings",
]


@lru_cache
def get_config_path() -> Path:
    return get_config_file(os.environ.get(CONFIG_PATH_ENV_NAME))


@lru_cache
def get_settings(
    config_path: Annotated[Path, Depends(get_config_path)],
) -> QualibrateRunnerSettings:
    config = get_config_solved_references_or_print_error(config_path)
    if config is None:
        raise RuntimeError("Couldn't read config file")
    qrs = get_config_model_or_print_error(config.get(CONFIG_KEY, {}))
    if qrs is None:
        raise RuntimeError("Couldn't read config file")
    return qrs
