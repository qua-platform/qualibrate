from collections.abc import Sequence
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, computed_field

from qualibrate.models.node_status import NodeStatus
from qualibrate.models.outcome import Outcome
from qualibrate.models.run_summary.run_error import RunError
from qualibrate.parameters import NodeParameters
from qualibrate.utils.type_protocols import TargetType

__all__ = ["ExecutionHistory", "ExecutionHistoryItem"]


class ExecutionHistoryItem(BaseModel):
    model_config = ConfigDict()

    name: str
    description: Optional[str] = None
    snapshot_idx: Optional[int] = None
    status: NodeStatus
    run_start: datetime
    run_end: datetime
    parameters: NodeParameters
    error: Optional[RunError] = None
    outcomes: dict[TargetType, Outcome] = Field(default_factory=dict)

    @computed_field
    def run_duration(self) -> float:
        return round((self.run_end - self.run_start).total_seconds(), 3)


class ExecutionHistory(BaseModel):
    items: Sequence[ExecutionHistoryItem]
