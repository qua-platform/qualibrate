import os
from functools import lru_cache
from pathlib import Path
from typing import Annotated

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
