import os
from functools import lru_cache
from itertools import product
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
    CORS_ORIGINS_ENV_NAME,
    ROOT_PATH_ENV_NAME,
)

__all__ = [
    "get_config_path",
    "get_cors_origin",
    "get_settings",
    "get_root_path",
    "get_qualibrate_config",
    "get_composite_settings",
]


@lru_cache
def get_config_path() -> Path:
    path = os.environ.get(CONFIG_PATH_ENV_NAME)
    if path is not None:
        return Path(path)
    return get_qualibrate_config_path()


@lru_cache
def get_cors_origin() -> list[str]:
    cors_env = os.environ.get(CORS_ORIGINS_ENV_NAME)
    if cors_env is not None:
        return list(cors_env.split(","))
    return list(
        f"http://{host}:{port}"
        for host, port in product(
            ["localhost", "127.0.0.1"], [1234, 8000, 8001]
        )
    )


@lru_cache
def get_root_path() -> str:
    return os.environ.get(ROOT_PATH_ENV_NAME, "")


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
