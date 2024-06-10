from enum import Enum
from typing import Any, List, Mapping

from pydantic import BaseModel, Field


class RunStatus(Enum):
    RUNNING = "running"
    FINISHED = "finished"
    ERROR = "error"


class LastRun(BaseModel):
    status: RunStatus
    name: str
    idx: int
    state_updates: List[Mapping[str, Any]] = Field(default_factory=list)
