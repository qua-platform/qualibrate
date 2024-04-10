from datetime import datetime, timezone

from pydantic import BaseModel, field_serializer
from pydantic_core.core_schema import SerializationInfo

from qualibrate.api.core.types import IdType

__all__ = ["ModelWithId", "ModelCreatedAt", "ModelWithIdCreatedAt"]


class ModelWithId(BaseModel):
    id: IdType


class ModelCreatedAt(BaseModel):
    created_at: datetime

    @field_serializer("created_at")
    def serialize_dt(self, dt: datetime, _info: SerializationInfo) -> str:
        return (
            dt.replace(tzinfo=timezone.utc)
            .astimezone()
            .isoformat(timespec="seconds")
        )


class ModelWithIdCreatedAt(ModelWithId, ModelCreatedAt):
    pass
