from pydantic import AwareDatetime, BaseModel, field_serializer

from qualibrate_app.api.core.types import IdType

__all__ = ["ModelWithId", "ModelCreatedAt", "ModelWithIdCreatedAt"]


class ModelWithId(BaseModel):
    id: IdType


class ModelCreatedAt(BaseModel):
    created_at: AwareDatetime

    @field_serializer("created_at")
    def dt_serializer(self, dt: AwareDatetime) -> str:
        return dt.isoformat(timespec="seconds")


class ModelWithIdCreatedAt(ModelWithId, ModelCreatedAt):
    pass
