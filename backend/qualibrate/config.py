import os
import sys
from functools import lru_cache
from pathlib import Path
from typing import Optional, Union

from pydantic import DirectoryPath, HttpUrl, field_serializer
from pydantic_core.core_schema import FieldSerializationInfo
from pydantic_settings import BaseSettings

if sys.version_info[:2] < (3, 11):
    import tomli as tomllib
else:
    import tomllib


CONFIG_KEY = "qualibrate"
QUALIBRATE_PATH = Path().home() / ".qualibrate"
DEFAULT_CONFIG_FILENAME = "config.toml"
DEFAULT_QUALIBRATE_CONFIG_FILENAME = "qualibrate.toml"
CONFIG_PATH_ENV_NAME = "QUALIBRATE_CONFIG_FILE"


class JsonTimelineDBBase(BaseSettings):
    spawn: bool
    address: HttpUrl
    timeout: float
    db_name: str

    @field_serializer("address")
    def serialize_http_url(
        self, url: HttpUrl, _info: FieldSerializationInfo
    ) -> str:
        return str(url)


class _QualibrateSettingsBase(BaseSettings):
    static_site_files: Path
    user_storage: Path
    metadata_out_path: str

    timeline_db: JsonTimelineDBBase


class QualibrateSettingsSetup(_QualibrateSettingsBase):
    @field_serializer("static_site_files", "user_storage")
    def serialize_path(self, path: Path, _info: FieldSerializationInfo) -> str:
        return str(path)


class QualibrateSettings(_QualibrateSettingsBase):
    static_site_files: DirectoryPath
    user_storage: DirectoryPath


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


@lru_cache
def get_settings() -> QualibrateSettings:
    config_file = get_config_file(os.environ.get(CONFIG_PATH_ENV_NAME))
    with config_file.open("rb") as fin:
        config = tomllib.load(fin)
    return QualibrateSettings(**(config.get(CONFIG_KEY, {})))
