from enum import Enum
from pathlib import Path
from typing import ClassVar, Optional

from pydantic import DirectoryPath, HttpUrl, field_serializer
from pydantic_core.core_schema import FieldSerializationInfo
from pydantic_settings import BaseSettings, SettingsConfigDict


class StorageType(Enum):
    local_storage = "local_storage"
    timeline_db = "timeline_db"


class RemoteServiceBase(BaseSettings):
    model_config: ClassVar[SettingsConfigDict] = SettingsConfigDict(
        extra="ignore",
    )
    address: HttpUrl
    timeout: float

    @field_serializer("address")
    def serialize_http_url(
        self, url: HttpUrl, _info: FieldSerializationInfo
    ) -> str:
        return str(url)


class JsonTimelineDBBase(RemoteServiceBase):
    pass


class QualibrateRunnerBase(RemoteServiceBase):
    pass


class QualibrateSettingsBase(BaseSettings):
    model_config: ClassVar[SettingsConfigDict] = SettingsConfigDict(
        extra="ignore",
    )
    static_site_files: Path
    storage_type: StorageType = StorageType.local_storage
    user_storage: Path
    project: Optional[str]
    metadata_out_path: str

    timeline_db: JsonTimelineDBBase
    runner: QualibrateRunnerBase


class QualibrateSettingsSetup(QualibrateSettingsBase):
    @field_serializer("static_site_files", "user_storage")
    def serialize_path(self, path: Path, _info: FieldSerializationInfo) -> str:
        return str(path)

    @field_serializer("storage_type")
    def serialize_storage_type(
        self, value: StorageType, _info: FieldSerializationInfo
    ) -> str:
        return value.value

    @field_serializer("project")
    def serialize_project(
        self, value: Optional[str], _info: FieldSerializationInfo
    ) -> str:
        return value or ""


class QualibrateSettings(QualibrateSettingsBase):
    static_site_files: DirectoryPath
    user_storage: DirectoryPath
    project: str
    active_machine_path: Optional[Path] = None
