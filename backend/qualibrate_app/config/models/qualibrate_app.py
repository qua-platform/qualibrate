from pathlib import Path
from typing import ClassVar

from pydantic import DirectoryPath, field_serializer
from pydantic_settings import SettingsConfigDict
from qualibrate_config.models import (
    PathSerializer,
    QualibrateSettings,
    Versioned,
)
from qualibrate_config.models.active_machine import (
    ActiveMachineSettings,
)
from qualibrate_config.models.base.base_referenced_settings import (
    BaseReferencedSettings,
)

from qualibrate_app.config.models.remote_services import (
    JsonTimelineDBBase,
    QualibrateRunnerBase,
)
from qualibrate_app.config.vars import Q_APP_SETTINGS_ENV_PREFIX

__all__ = [
    "QualibrateAppSettings",
    "QualibrateAppSettingsBase",
    "QualibrateAppSettingsSetup",
]


class QualibrateAppSettingsBase(
    BaseReferencedSettings, PathSerializer, Versioned
):
    model_config: ClassVar[SettingsConfigDict] = SettingsConfigDict(
        extra="ignore", env_prefix=Q_APP_SETTINGS_ENV_PREFIX
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
