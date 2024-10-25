from collections.abc import Mapping, Sequence
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field, computed_field, field_serializer

from qualibrate.models.outcome import Outcome
from qualibrate.models.run_summary.run_error import RunError
from qualibrate.parameters import RunnableParameters
from qualibrate.utils.type_protocols import TargetType

__all__ = ["BaseRunSummary"]


class BaseRunSummary(BaseModel):
    name: str
    description: Optional[str] = None
    created_at: datetime
    completed_at: datetime
    parameters: Optional[RunnableParameters] = None
    outcomes: dict[TargetType, Outcome]
    error: Optional[RunError] = None

    initial_targets: Sequence[TargetType] = Field(default_factory=list)
    successful_targets: list[TargetType] = Field(default_factory=list)
    failed_targets: list[TargetType] = Field(default_factory=list)
    dropped_targets: Optional[list[TargetType]] = None
    state_updates: Mapping[str, Any] = Field(default_factory=dict)

    @computed_field
    def run_duration(self) -> float:
        return round((self.completed_at - self.created_at).total_seconds(), 3)

    @field_serializer("parameters")
    def serialize_parameters(
        self, parameters: RunnableParameters
    ) -> Mapping[str, Any]:
        return parameters.model_dump(serialize_as_any=True)
