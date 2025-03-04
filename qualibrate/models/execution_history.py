from collections.abc import Sequence
from typing import Any, Optional

from pydantic import AwareDatetime, BaseModel, ConfigDict, Field, computed_field

from qualibrate.models.node_status import NodeStatus
from qualibrate.models.outcome import Outcome
from qualibrate.models.run_summary.run_error import RunError
from qualibrate.parameters import NodeParameters
from qualibrate.utils.type_protocols import TargetType

__all__ = [
    "ExecutionHistory",
    "ExecutionHistoryItem",
    "ItemData",
    "ItemMetadata",
]


class ItemMetadata(BaseModel):
    model_config = ConfigDict(extra="allow")

    name: str
    status: NodeStatus
    description: Optional[str] = None
    run_start: AwareDatetime
    run_end: AwareDatetime

    @computed_field
    def run_duration(self) -> float:
        return round((self.run_end - self.run_start).total_seconds(), 3)


class ItemData(BaseModel):
    model_config = ConfigDict(extra="allow")

    quam: Optional[dict[str, Any]] = None
    parameters: NodeParameters
    outcomes: dict[TargetType, Outcome] = Field(default_factory=dict)
    error: Optional[RunError] = None


class ExecutionHistoryItem(BaseModel):
    """Represents an item of graph execution history."""

    model_config = ConfigDict()

    id: Optional[int] = None
    created_at: AwareDatetime
    metadata: ItemMetadata
    data: ItemData
    # TODO: add structure for metadata
    # description: Optional[str] = None # metadata
    # status: NodeStatus # metadata
    # run_start: AwareDatetime # metadata
    # run_end: AwareDatetime # metadata
    # TODO: add structure for data
    # parameters: NodeParameters data
    # error: Optional[RunError] = None # data
    # outcomes: dict[TargetType, Outcome] = Field(default_factory=dict)


class ExecutionHistory(BaseModel):
    """Represents a graph execution history."""

    items: Sequence[ExecutionHistoryItem]
