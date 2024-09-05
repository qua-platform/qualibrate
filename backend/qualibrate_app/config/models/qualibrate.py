from typing import Optional

from pydantic import field_serializer
from pydantic_core.core_schema import FieldSerializationInfo
from pydantic_settings import BaseSettings

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
    project: Optional[str]
    storage: StorageSettingsBase


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
