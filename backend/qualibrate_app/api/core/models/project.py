from collections.abc import Mapping
from typing import Any

from pydantic import AwareDatetime, BaseModel, Field, field_serializer


class Project(BaseModel):
    name: str
    nodes_number: int
    created_at: AwareDatetime
    last_modified_at: AwareDatetime
    updates: Mapping[str, Any] = Field(default_factory=dict)

    @field_serializer("created_at", "last_modified_at")
    def dt_serializer(self, dt: AwareDatetime) -> str:
        return dt.isoformat(timespec="seconds")
