from pathlib import Path
from typing import Optional

from pydantic import field_serializer
from pydantic_settings import BaseSettings
from qualibrate_config.models import PathSerializer

__all__ = [
    "ActiveMachineSettings",
    "ActiveMachineSettingsBase",
    "ActiveMachineSettingsSetup",
]


class ActiveMachineSettingsBase(BaseSettings, PathSerializer):
    path: Optional[Path] = None


class ActiveMachineSettingsSetup(ActiveMachineSettingsBase):
    path_serializer = field_serializer("path")(PathSerializer.serialize_path)


class ActiveMachineSettings(ActiveMachineSettingsBase):
    # path: DirectoryPath # TODO: require directory
    pass
