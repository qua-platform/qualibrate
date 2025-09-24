from collections.abc import Mapping, Sequence
from typing import Any

from pydantic import (
    AwareDatetime,
    BaseModel,
    ConfigDict,
    Field,
    computed_field,
    field_serializer,
)

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
    description: str | None = None
    run_start: AwareDatetime
    run_end: AwareDatetime

    @computed_field
    def run_duration(self) -> float:
        return round((self.run_end - self.run_start).total_seconds(), 3)


class ItemData(BaseModel):
    model_config = ConfigDict(extra="allow")

    quam: dict[str, Any] | None = None
    parameters: NodeParameters
    outcomes: dict[TargetType, Outcome] = Field(default_factory=dict)
    error: RunError | None = None

    @field_serializer("parameters")
    def serialize_parameters(
        self, parameters: NodeParameters
    ) -> Mapping[str, Any]:
        return parameters.model_dump(serialize_as_any=True)


class ExecutionHistoryItem(BaseModel):
    """Represents an item of graph execution history."""

    model_config = ConfigDict()

    id: int | None = None
    created_at: AwareDatetime
    metadata: ItemMetadata
    data: ItemData


class ExecutionHistory(BaseModel):
    """Represents a graph execution history."""

    items: Sequence[ExecutionHistoryItem]
