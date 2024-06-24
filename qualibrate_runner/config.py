import os
import sys
from functools import lru_cache
from pathlib import Path
from typing import Annotated, Any, Callable, Mapping, Optional, Union

from fastapi import Depends
from pydantic import BaseModel, DirectoryPath, ImportString
from pydantic_settings import BaseSettings, SettingsConfigDict
from qualibrate.qualibration_library import QualibrationLibrary

from qualibrate_runner.core.models.last_run import LastRun, RunStatus
from qualibrate_runner.utils.config_references import resolve_references

if sys.version_info[:2] < (3, 11):
    import tomli as tomllib
else:
    import tomllib

CONFIG_KEY = "qualibrate_runner"
QUALIBRATE_PATH = Path().home() / ".qualibrate"
DEFAULT_CONFIG_FILENAME = "config.toml"
DEFAULT_QUALIBRATE_CONFIG_FILENAME = "qualibrate-runner.toml"
CONFIG_PATH_ENV_NAME = "QUALIBRATE_RUNNER_CONFIG_FILE"


__all__ = [
    "State",
    "QualibrateRunnerSettings",
    "get_config_file",
    "read_config_file",
    "get_config_path",
    "get_settings",
]


class State(BaseModel):
    passed_parameters: Mapping[str, Any] = {}
    persistent: dict[str, Any] = {}
    last_run: Optional[LastRun] = None
    node: Optional[str] = None

    @property
    def is_running(self) -> bool:
        return (
            self.last_run is not None
            and self.last_run.status == RunStatus.RUNNING
        )


class QualibrateRunnerSettings(BaseSettings):
    model_config = SettingsConfigDict(frozen=True)

    calibration_library_resolver: ImportString[
        Callable[[Path], QualibrationLibrary]
    ]
    calibration_library_folder: DirectoryPath


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
) -> QualibrateRunnerSettings:
    config = read_config_file(config_path, solve_references=True)
    return QualibrateRunnerSettings(**(config.get(CONFIG_KEY, {})))
