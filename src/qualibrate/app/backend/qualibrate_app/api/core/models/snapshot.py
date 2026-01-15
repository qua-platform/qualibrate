from collections.abc import Sequence
from typing import Annotated, Any

from pydantic import AwareDatetime, BaseModel, ConfigDict, Field, computed_field

from qualibrate_app.api.core.models.base import ModelWithIdCreatedAt
from qualibrate_app.api.core.types import IdType


class SimplifiedSnapshot(ModelWithIdCreatedAt):
    parents: list[IdType]


class SnapshotMetadata(BaseModel):
    model_config = ConfigDict(extra="allow")

    status: str | None = None
    name: str | None = None
    description: str | None = None
    run_start: AwareDatetime | None = None
    run_end: AwareDatetime | None = None

    @computed_field
    def run_duration(self) -> float | None:
        if self.run_start is None or self.run_end is None:
            return None
        return round((self.run_end - self.run_start).total_seconds(), 3)


class SimplifiedSnapshotWithMetadata(SimplifiedSnapshot):
    metadata: SnapshotMetadata


class SnapshotData(BaseModel):
    model_config = ConfigDict(extra="allow")

    quam: dict[str, Any] | None = None
    parameters: dict[str, Any] | None = None
    results: dict[str, Any] | None = None
    outcomes: dict[str, Any] | None = None

    @computed_field
    def machine(self) -> dict[str, Any] | None:
        return self.quam


class Snapshot(SimplifiedSnapshot):
    metadata: Annotated[
        SnapshotMetadata, Field(default_factory=SnapshotMetadata)
    ]
    data: SnapshotData | None = None


class MachineSearchResults(BaseModel):
    key: Sequence[str | int] | None = None
    value: Any


class SnapshotSearchResult(MachineSearchResults):
    snapshot: SimplifiedSnapshot
    value: Any = None
