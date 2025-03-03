from collections.abc import Sequence
from typing import Annotated, Any, Optional

from pydantic import AwareDatetime, BaseModel, ConfigDict, Field

__all__ = ["ExecutionHistory", "ExecutionHistoryItem"]


class ExecutionHistoryItem(BaseModel):
    """Represents an item of graph execution history."""

    model_config = ConfigDict()

    name: str
    id: Optional[int] = None
    created_at: AwareDatetime  # equal to metadata.run_start
    metadata: Annotated[dict[str, Any], Field(default_factory=dict)]
    data: Annotated[dict[str, Any], Field(default_factory=dict)]
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
