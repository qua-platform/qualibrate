from datetime import datetime
from typing import Dict, List, Optional, Sequence

from pydantic import BaseModel, Field, computed_field

from qualibrate.outcome import Outcome
from qualibrate.parameters import RunnableParameters
from qualibrate.utils.type_protocols import TargetType

__all__ = ["BaseRunSummary"]


class BaseRunSummary(BaseModel):
    name: str
    description: Optional[str] = None
    created_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    parameters: RunnableParameters
    outcomes: Dict[TargetType, Outcome]

    initial_targets: Sequence[TargetType] = Field(default_factory=list)
    successful_targets: List[TargetType] = Field(default_factory=list)
    failed_targets: List[TargetType] = Field(default_factory=list)
    dropped_targets: Optional[List[TargetType]] = None

    @computed_field
    def run_duration(self) -> Optional[int]:
        if self.created_at is None or self.completed_at is None:
            return None
        return int(round((self.completed_at - self.created_at).total_seconds()))
