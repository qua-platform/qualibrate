import os
from functools import lru_cache
from pathlib import Path
from typing import Annotated

from fastapi import Depends
from qualibrate_config.models import QualibrateCompositeConfig, QualibrateConfig
from qualibrate_config.resolvers import (
    get_qualibrate_config,
    get_qualibrate_config_path,
)

from qualibrate_composite.config.vars import (
    CONFIG_PATH_ENV_NAME,
)

__all__ = ["get_config_path", "get_settings"]


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


def get_composite_settings(
    config: Annotated[QualibrateConfig, Depends(get_settings)],
) -> QualibrateCompositeConfig:
    if config.composite is None:
        raise RuntimeError("Composite part not specified in config.toml")
    return config.composite
