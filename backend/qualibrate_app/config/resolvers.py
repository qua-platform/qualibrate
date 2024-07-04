import os
import sys
from functools import lru_cache
from pathlib import Path
from typing import Annotated, Any, Optional, Union

from fastapi import Depends

from qualibrate_app.config.models import QualibrateSettings
from qualibrate_app.config.references.resolvers import resolve_references
from qualibrate_app.config.validation import (
    get_config_model_or_print_error,
    get_config_solved_references_or_print_error,
)
from qualibrate_app.config.vars import (
    CONFIG_KEY,
    CONFIG_PATH_ENV_NAME,
    DEFAULT_CONFIG_FILENAME,
    DEFAULT_QUALIBRATE_CONFIG_FILENAME,
    QUALIBRATE_PATH,
)

if sys.version_info[:2] < (3, 11):
    import tomli as tomllib
else:
    import tomllib


def _get_config_file_from_dir(
    dir_path: Path, raise_not_exists: bool = True
) -> Path:
    default_qualibrate = dir_path / DEFAULT_QUALIBRATE_CONFIG_FILENAME
    if default_qualibrate.is_file():
        return default_qualibrate
    default_common = dir_path / DEFAULT_CONFIG_FILENAME
    if default_common.is_file():
        return default_common
    if raise_not_exists:
        raise FileNotFoundError(f"Config file in dir {dir_path} does not exist")
    return default_common


def get_config_file(
    config_path: Optional[Union[str, Path]], raise_not_exists: bool = True
) -> Path:
    if config_path is not None:
        config_path_ = Path(config_path)
        if config_path_.is_file():
            return config_path_
        if config_path_.is_dir():
            return _get_config_file_from_dir(config_path_)
        if raise_not_exists:
            raise OSError("Unexpected config file path")
        return config_path_
    if config_path is None:
        return _get_config_file_from_dir(QUALIBRATE_PATH)


def read_config_file(
    config_file: Path, solve_references: bool = True
) -> dict[str, Any]:
    with config_file.open("rb") as fin:
        config = tomllib.load(fin)
    if not solve_references:
        return config
    return resolve_references(config)


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
