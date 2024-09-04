from pathlib import Path
from typing import Optional

from pydantic import BaseModel, field_serializer

from qualibrate_app.config.models.path_serializer import PathSerializer

__all__ = [
    "ActiveMachineSettings",
    "ActiveMachineSettingsBase",
    "ActiveMachineSettingsSetup",
]


class ActiveMachineSettingsBase(BaseModel, PathSerializer):
    path: Optional[Path] = None


class ActiveMachineSettingsSetup(ActiveMachineSettingsBase):
    path_serializer = field_serializer("path")(PathSerializer.serialize_path)


class ActiveMachineSettings(ActiveMachineSettingsBase):
    # path: DirectoryPath # TODO: require directory
    pass
