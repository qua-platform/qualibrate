from pathlib import Path

from pydantic import DirectoryPath, field_serializer
from pydantic_core.core_schema import FieldSerializationInfo
from pydantic_settings import BaseSettings

from qualibrate_app.config.models.path_serializer import PathSerializer
from qualibrate_app.config.models.storage_type import StorageType

__all__ = ["StorageSettings", "StorageSettingsBase", "StorageSettingsSetup"]


class StorageSettingsBase(BaseSettings, PathSerializer):
    type: StorageType = StorageType.local_storage
    location: Path


class StorageSettingsSetup(StorageSettingsBase):
    @field_serializer("type")
    def serialize_storage_type(
        self, value: StorageType, _info: FieldSerializationInfo
    ) -> str:
        return value.value

    location_serializer = field_serializer("location")(
        PathSerializer.serialize_path
    )


class StorageSettings(StorageSettingsBase):
    location: DirectoryPath
