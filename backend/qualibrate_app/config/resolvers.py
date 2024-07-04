import os
from functools import lru_cache
from pathlib import Path
from typing import Annotated

from fastapi import Depends

from qualibrate_app.config.file import get_config_file
from qualibrate_app.config.models import QualibrateSettings
from qualibrate_app.config.validation import (
    get_config_model_or_print_error,
    get_config_solved_references_or_print_error,
)
from qualibrate_app.config.vars import (
    CONFIG_KEY,
    CONFIG_PATH_ENV_NAME,
)


@lru_cache
def get_config_path() -> Path:
    return get_config_file(os.environ.get(CONFIG_PATH_ENV_NAME))


@lru_cache
def get_settings(
    config_path: Annotated[Path, Depends(get_config_path)],
) -> QualibrateSettings:
    config = get_config_solved_references_or_print_error(config_path)
    if config is None:
        raise RuntimeError("Couldn't read config file")
    qs = get_config_model_or_print_error(
        config.get(CONFIG_KEY, {}), QualibrateSettings
    )
    if qs is None:
        raise RuntimeError("Couldn't read config file")
    return qs
