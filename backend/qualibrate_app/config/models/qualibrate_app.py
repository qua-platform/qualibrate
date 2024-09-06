from pathlib import Path
from typing import ClassVar

from pydantic import DirectoryPath, field_serializer
from pydantic_settings import BaseSettings, SettingsConfigDict

from qualibrate_app.config.models.active_machine import (
    ActiveMachineSettings,
)
from qualibrate_app.config.models.path_serializer import PathSerializer
from qualibrate_app.config.models.qualibrate import QualibrateSettings
from qualibrate_app.config.models.remote_services import (
    JsonTimelineDBBase,
    QualibrateRunnerBase,
)
from qualibrate_app.config.models.versioned import Versioned

__all__ = [
    "QualibrateAppSettings",
    "QualibrateAppSettingsBase",
    "QualibrateAppSettingsSetup",
]


class QualibrateAppSettingsBase(BaseSettings, PathSerializer, Versioned):
    model_config: ClassVar[SettingsConfigDict] = SettingsConfigDict(
        extra="ignore",
    )
    static_site_files: Path
    metadata_out_path: str

    timeline_db: JsonTimelineDBBase
    runner: QualibrateRunnerBase


class QualibrateAppSettingsSetup(QualibrateAppSettingsBase):
    static_files_serializer = field_serializer("static_site_files")(
        PathSerializer.serialize_path
    )


class QualibrateAppSettings(QualibrateAppSettingsBase):
    static_site_files: DirectoryPath
    qualibrate: QualibrateSettings
    active_machine: ActiveMachineSettings
