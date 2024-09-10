from datetime import datetime
from enum import Enum
from typing import Any, Mapping, Optional, Union

from pydantic import BaseModel, Field, computed_field
from qualibrate.run_summary.graph import GraphRunSummary
from qualibrate.run_summary.node import NodeRunSummary


class RunStatus(Enum):
    RUNNING = "running"
    FINISHED = "finished"
    ERROR = "error"


class RunnableType(Enum):
    NODE = "node"
    GRAPH = "graph"


class RunError(BaseModel):
    error_class: str
    message: str
    traceback: list[str]


class StateUpdate(BaseModel):
    key: str
    attr: Union[str, int]
    old: Any
    new: Any
    updated: bool = False


class LastRun(BaseModel):
    status: RunStatus
    started_at: datetime
    completed_at: Optional[datetime] = None
    name: str
    idx: int
    runnable_type: RunnableType
    run_result: Optional[Union[NodeRunSummary, GraphRunSummary]] = None
    state_updates: Mapping[str, StateUpdate] = Field(default_factory=dict)
    error: Optional[RunError] = None

    @computed_field
    def run_duration(self) -> float:
        duration = (
            self.completed_at - self.started_at
            if self.completed_at is not None
            else datetime.now() - self.started_at
        )
        return round(duration.total_seconds(), 3)
