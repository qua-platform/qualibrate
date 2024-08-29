from typing import Optional

from pydantic import field_serializer
from pydantic_core.core_schema import FieldSerializationInfo
from pydantic_settings import BaseSettings

from qualibrate_app.config.models.active_machine import (
    ActiveMachineSettings,
    ActiveMachineSettingsBase,
    ActiveMachineSettingsSetup,
)
from qualibrate_app.config.models.storage import (
    StorageSettings,
    StorageSettingsBase,
    StorageSettingsSetup,
)

__all__ = [
    "QualibrateSettings",
    "QualibrateSettingsBase",
    "QualibrateSettingsSetup",
]


class QualibrateSettingsBase(BaseSettings):
    project: Optional[str]
    storage: StorageSettingsBase
    active_machine: ActiveMachineSettingsBase


class QualibrateSettingsSetup(QualibrateSettingsBase):
    storage: StorageSettingsSetup
    active_machine: ActiveMachineSettingsSetup

    @field_serializer("project")
    def serialize_project(
        self, value: Optional[str], _info: FieldSerializationInfo
    ) -> str:
        return value or ""


class QualibrateSettings(QualibrateSettingsBase):
    project: str
    storage: StorageSettings
    active_machine: ActiveMachineSettings
