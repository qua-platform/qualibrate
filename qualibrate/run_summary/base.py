from datetime import datetime
from typing import Any, Dict, List, Mapping, Optional, Sequence

from pydantic import BaseModel, Field, computed_field, field_serializer

from qualibrate.outcome import Outcome
from qualibrate.parameters import RunnableParameters
from qualibrate.utils.type_protocols import TargetType

__all__ = ["BaseRunSummary"]


class BaseRunSummary(BaseModel):
    name: str
    description: Optional[str] = None
    created_at: datetime
    completed_at: datetime
    parameters: RunnableParameters
    outcomes: Dict[TargetType, Outcome]

    initial_targets: Sequence[TargetType] = Field(default_factory=list)
    successful_targets: List[TargetType] = Field(default_factory=list)
    failed_targets: List[TargetType] = Field(default_factory=list)
    dropped_targets: Optional[List[TargetType]] = None

    @computed_field
    def run_duration(self) -> float:
        return round((self.completed_at - self.created_at).total_seconds(), 3)

    @field_serializer("parameters")
    def serialize_parameters(
        self, parameters: RunnableParameters
    ) -> Mapping[str, Any]:
        return parameters.model_dump(serialize_as_any=True)
