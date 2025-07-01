from typing import Annotated, Any, Optional

from pydantic import AwareDatetime, BaseModel, ConfigDict, Field, computed_field

from qualibrate_app.api.core.models.base import ModelWithIdCreatedAt
from qualibrate_app.api.core.types import IdType


class SimplifiedSnapshot(ModelWithIdCreatedAt):
    parents: list[IdType]


class SnapshotMetadata(BaseModel):
    model_config = ConfigDict(extra="allow")

    status: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    run_start: Optional[AwareDatetime] = None
    run_end: Optional[AwareDatetime] = None

    @computed_field
    def run_duration(self) -> Optional[float]:
        if self.run_start is None or self.run_end is None:
            return None
        return round((self.run_end - self.run_start).total_seconds(), 3)


class SimplifiedSnapshotWithMetadata(SimplifiedSnapshot):
    metadata: SnapshotMetadata


class SnapshotData(BaseModel):
    model_config = ConfigDict(extra="allow")

    quam: Optional[dict[str, Any]] = None
    parameters: Optional[dict[str, Any]] = None
    results: Optional[dict[str, Any]] = None
    outcomes: Optional[dict[str, Any]] = None

    @computed_field
    def machine(self) -> Optional[dict[str, Any]]:
        return self.quam


class Snapshot(SimplifiedSnapshot):
    metadata: Annotated[
        SnapshotMetadata, Field(default_factory=SnapshotMetadata)
    ]
    data: Optional[SnapshotData] = None
