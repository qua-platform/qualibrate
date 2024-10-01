import os
from functools import lru_cache
from pathlib import Path
from typing import Annotated

from fastapi import Depends

from qualibrate_composite.config.file import get_config_file, read_config_file
from qualibrate_composite.config.models.composite import QualibrateSettings
from qualibrate_composite.config.vars import CONFIG_KEY, CONFIG_PATH_ENV_NAME

__all__ = ["get_config_path", "get_settings"]


@lru_cache
def get_config_path() -> Path:
    return get_config_file(os.environ.get(CONFIG_PATH_ENV_NAME))


@lru_cache
def get_settings(
    config_path: Annotated[Path, Depends(get_config_path)],
) -> QualibrateSettings:
    config = read_config_file(config_path, solve_references=True)
    return QualibrateSettings(**(config.get(CONFIG_KEY, {})))
