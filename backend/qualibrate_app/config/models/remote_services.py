from functools import cached_property
from typing import ClassVar

from pydantic import HttpUrl, field_serializer
from pydantic_core.core_schema import FieldSerializationInfo
from pydantic_settings import BaseSettings, SettingsConfigDict

__all__ = ["RemoteServiceBase", "JsonTimelineDBBase", "QualibrateRunnerBase"]


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

    @cached_property
    def address_with_root(self) -> str:
        address = str(self.address)
        return address if address.endswith("/") else address + "/"


class JsonTimelineDBBase(RemoteServiceBase):
    pass


class QualibrateRunnerBase(RemoteServiceBase):
    pass
