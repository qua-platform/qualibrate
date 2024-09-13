from pathlib import Path
from typing import Optional

from pydantic import field_serializer
from pydantic_core.core_schema import FieldSerializationInfo
from pydantic_settings import BaseSettings, SettingsConfigDict

from qualibrate_app.config.models.storage import (
    StorageSettings,
    StorageSettingsBase,
    StorageSettingsSetup,
)
from qualibrate_app.config.models.versioned import Versioned

__all__ = [
    "QualibrateSettings",
    "QualibrateSettingsBase",
    "QualibrateSettingsSetup",
]


class QualibrateSettingsBase(BaseSettings, Versioned):
    model_config = SettingsConfigDict(extra="ignore")

    project: Optional[str]
    storage: StorageSettingsBase
    log_folder: Optional[Path] = None


class QualibrateSettingsSetup(QualibrateSettingsBase):
    storage: StorageSettingsSetup

    @field_serializer("project")
    def serialize_project(
        self, value: Optional[str], _info: FieldSerializationInfo
    ) -> str:
        return value or ""


class QualibrateSettings(QualibrateSettingsBase):
    project: str
    storage: StorageSettings
