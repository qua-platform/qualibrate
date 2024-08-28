from enum import Enum
from typing import Any, Mapping, Optional, Union

from pydantic import BaseModel, Field
from qualibrate.run_summary.graph import GraphRunSummary
from qualibrate.run_summary.node import NodeRunSummary


class RunStatus(Enum):
    RUNNING = "running"
    FINISHED = "finished"
    ERROR = "error"


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
    name: str
    idx: int
    run_result: Optional[Union[NodeRunSummary, GraphRunSummary]] = None
    state_updates: Mapping[str, StateUpdate] = Field(default_factory=dict)
    error: Optional[RunError] = None
