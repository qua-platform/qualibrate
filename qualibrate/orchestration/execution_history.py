from datetime import datetime
from typing import Dict, Hashable, Optional, Sequence

from pydantic import BaseModel, ConfigDict, Field, computed_field

from qualibrate import NodeParameters
from qualibrate.outcome import Outcome


class ExecutionHistoryItem(BaseModel):
    model_config = ConfigDict()

    name: str
    description: Optional[str] = None
    snapshot_idx: Optional[int] = None
    run_start: datetime
    run_end: datetime
    parameters: NodeParameters
    outcomes: Dict[Hashable, Outcome] = Field(default_factory=dict)

    @computed_field
    def run_duration(self) -> float:
        return round((self.run_end - self.run_start).total_seconds(), 3)


class ExecutionHistory(BaseModel):
    items: Sequence[ExecutionHistoryItem]
