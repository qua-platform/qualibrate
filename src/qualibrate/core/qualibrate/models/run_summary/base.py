from collections.abc import Mapping, Sequence
from typing import Any

from pydantic import (
    AwareDatetime,
    BaseModel,
    Field,
    computed_field,
    field_serializer,
)

from qualibrate.models.outcome import Outcome
from qualibrate.models.run_summary.run_error import RunError
from qualibrate.parameters import RunnableParameters
from qualibrate.utils.type_protocols import TargetType

__all__ = ["BaseRunSummary"]


class BaseRunSummary(BaseModel):
    name: str
    description: str | None = None
    created_at: AwareDatetime
    completed_at: AwareDatetime
    parameters: RunnableParameters | None = None
    outcomes: dict[TargetType, Outcome]
    error: RunError | None = None

    initial_targets: Sequence[TargetType] = Field(default_factory=list)
    successful_targets: list[TargetType] = Field(default_factory=list)
    failed_targets: list[TargetType] = Field(default_factory=list)
    dropped_targets: list[TargetType] | None = None
    state_updates: Mapping[str, Any] = Field(default_factory=dict)

    @computed_field
    def run_duration(self) -> float:
        return round((self.completed_at - self.created_at).total_seconds(), 3)

    @field_serializer("parameters")
    def serialize_parameters(
        self, parameters: RunnableParameters
    ) -> Mapping[str, Any]:
        return parameters.model_dump(serialize_as_any=True)
