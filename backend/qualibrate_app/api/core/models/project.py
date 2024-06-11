from pydantic import AwareDatetime, BaseModel, field_serializer


class Project(BaseModel):
    name: str
    nodes_number: int
    created_at: AwareDatetime
    last_modified_at: AwareDatetime

    @field_serializer("created_at", "last_modified_at")
    def dt_serializer(self, dt: AwareDatetime) -> str:
        return dt.isoformat(timespec="seconds")
