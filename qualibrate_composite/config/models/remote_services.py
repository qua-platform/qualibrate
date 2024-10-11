from pydantic import HttpUrl, field_serializer
from pydantic_core.core_schema import FieldSerializationInfo
from pydantic_settings import BaseSettings

__all__ = ["RemoteServiceBase", "QualibrateApp", "QualibrateRunner"]


class RemoteServiceBase(BaseSettings):
    spawn: bool
    address: HttpUrl
    timeout: float

    @field_serializer("address")
    def serialize_http_url(
        self, url: HttpUrl, _info: FieldSerializationInfo
    ) -> str:
        return str(url)


class QualibrateApp(BaseSettings):
    spawn: bool


class QualibrateRunner(RemoteServiceBase):
    pass
