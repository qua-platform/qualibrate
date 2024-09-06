from enum import Enum
from typing import ClassVar

from pydantic_settings import BaseSettings, SettingsConfigDict


class StorageType(Enum):
    local_storage = "local_storage"


class BaseSubSettings(BaseSettings):
    model_config: ClassVar[SettingsConfigDict] = SettingsConfigDict(
        extra="ignore",
    )


class TimelineDbSettings(BaseSubSettings):
    pass


class TimelineDbSettingsSetup(BaseSubSettings):
    pass


class QualibrateRunnerSettings(BaseSubSettings):
    pass


class ActiveMachineSettingsSetup(BaseSubSettings):
    pass


class QualibrateAppSettings(BaseSubSettings):
    pass


class QualibrateAppQSettingsSetup(BaseSubSettings):
    pass


class QualibrateAppSettingsSetup(BaseSubSettings):
    pass
