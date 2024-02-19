import os
from functools import lru_cache
from pathlib import Path

from pydantic import DirectoryPath, field_serializer, HttpUrl
from pydantic_core.core_schema import FieldSerializationInfo
from pydantic_settings import BaseSettings

import sys

if sys.version_info[:2] < (3, 11):
    import tomli as tomllib
else:
    import tomllib


DEFAULT_CONFIG_PATH = Path().home().joinpath(".qualibrate", "config.toml")
CONFIG_PATH_ENV_NAME = "QUALIBRATE_CONFIG_FILE"


class _QualibrateSettingsBase(BaseSettings):
    static_site_files: Path
    user_storage: Path
    timeline_db_address: HttpUrl
    timeline_db_timeout: float
    timeline_db_name: str


class QualibrateSettingsSetup(_QualibrateSettingsBase):
    @field_serializer("static_site_files", "user_storage")
    def serialize_path(self, path: Path, _info: FieldSerializationInfo) -> str:
        return str(path)

    @field_serializer("timeline_db_address")
    def serialize_http_url(
        self, url: HttpUrl, _info: FieldSerializationInfo
    ) -> str:
        return str(url)


class QualibrateSettings(_QualibrateSettingsBase):
    static_site_files: DirectoryPath
    user_storage: DirectoryPath


@lru_cache
def get_settings() -> QualibrateSettings:
    config_file = Path(
        os.environ.get(CONFIG_PATH_ENV_NAME, DEFAULT_CONFIG_PATH)
    )
    with config_file.open("rb") as fin:
        config = tomllib.load(fin)
    return QualibrateSettings(**config)
