from functools import lru_cache
from pathlib import Path

from pydantic import Field, DirectoryPath
from pydantic_settings import SettingsConfigDict, BaseSettings


class QualibrateSettings(BaseSettings):
    static_site_files: DirectoryPath = Field(
        default=Path(__file__).parents[1] / "qualibrate_static"
    )
    user_storage: DirectoryPath = Field(default=Path().home() / '.qualibrate')
    model_config = SettingsConfigDict(env_prefix='qualibrate_')


@lru_cache
def get_settings() -> QualibrateSettings:
    return QualibrateSettings()
