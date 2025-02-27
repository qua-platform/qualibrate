from typing import Any, Optional

from pydantic import AwareDatetime, Field, computed_field

from qualibrate_app.api.core.models.base import ModelWithIdCreatedAt
from qualibrate_app.api.core.types import IdType


class SimplifiedSnapshot(ModelWithIdCreatedAt):
    run_start: Optional[AwareDatetime] = None
    run_end: Optional[AwareDatetime] = None
    parents: list[IdType]

    @computed_field
    def run_duration(self) -> Optional[float]:
        """Time in seconds node run"""
        if self.run_end is None or self.run_start is None:
            return None
        return round((self.run_end - self.run_start).total_seconds(), 3)


class SimplifiedSnapshotWithMetadata(SimplifiedSnapshot):
    metadata: dict[str, Any]


class Snapshot(SimplifiedSnapshot):
    metadata: dict[str, Any] = Field(default_factory=dict)
    parameters: Optional[dict[str, Any]] = None
    outcomes: Optional[dict[str, str]] = None
    data: Optional[dict[str, Any]] = None
