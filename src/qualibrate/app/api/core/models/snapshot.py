from collections.abc import Sequence
from enum import Enum
from typing import Annotated, Any, Literal

from pydantic import AwareDatetime, BaseModel, ConfigDict, Field, computed_field

from qualibrate.app.api.core.models.base import ModelWithIdCreatedAt
from qualibrate.app.api.core.types import IdType


class ExecutionType(str, Enum):
    """Type of execution for a snapshot - either a single node or a workflow."""

    node = "node"
    workflow = "workflow"


class QubitOutcome(BaseModel):
    """Outcome status for a single qubit/target in a workflow."""

    status: Literal["success", "failure"]
    failed_on: str | None = None


class SimplifiedSnapshot(ModelWithIdCreatedAt):
    parents: list[IdType]


class SnapshotMetadata(BaseModel):
    model_config = ConfigDict(extra="allow")

    status: str | None = None
    name: str | None = None
    description: str | None = None
    run_start: AwareDatetime | None = None
    run_end: AwareDatetime | None = None

    @computed_field
    def run_duration(self) -> float | None:
        if self.run_start is None or self.run_end is None:
            return None
        return round((self.run_end - self.run_start).total_seconds(), 3)


class SimplifiedSnapshotWithMetadata(SimplifiedSnapshot):
    metadata: SnapshotMetadata
    tags: list[str] | None = None


class SnapshotData(BaseModel):
    model_config = ConfigDict(extra="allow")

    quam: dict[str, Any] | None = None
    parameters: dict[str, Any] | None = None
    results: dict[str, Any] | None = None
    outcomes: dict[str, Any] | None = None

    @computed_field
    def machine(self) -> dict[str, Any] | None:
        return self.quam


class Snapshot(SimplifiedSnapshot):
    metadata: Annotated[
        SnapshotMetadata, Field(default_factory=SnapshotMetadata)
    ]
    data: SnapshotData | None = None


class MachineSearchResults(BaseModel):
    key: Sequence[str | int] | None = None
    value: Any


class SnapshotSearchResult(MachineSearchResults):
    snapshot: SimplifiedSnapshot
    value: Any = None


class SnapshotHistoryMetadata(SnapshotMetadata):
    """Extended metadata for snapshot history items with workflow-specific fields."""

    type_of_execution: ExecutionType = ExecutionType.node
    children: list[IdType] | None = None
    workflow_parent_id: IdType | None = None


class SnapshotHistoryItem(ModelWithIdCreatedAt):
    """A snapshot item in the history response, supporting nested workflows.

    For nodes:
        - type_of_execution = "node"
        - items = None
        - outcomes, nodes_completed, etc. = None

    For workflows:
        - type_of_execution = "workflow"
        - items = list of child SnapshotHistoryItem
        - outcomes = aggregated outcomes from all children
        - nodes_completed, nodes_total, qubits_completed, qubits_total populated
    """

    parents: list[IdType]
    metadata: SnapshotHistoryMetadata
    type_of_execution: ExecutionType = ExecutionType.node

    # Workflow-only fields: nested items
    items: list["SnapshotHistoryItem"] | None = None

    # Workflow aggregate statistics
    outcomes: dict[str, QubitOutcome] | None = None
    nodes_completed: int | None = None
    nodes_total: int | None = None
    qubits_completed: int | None = None
    qubits_total: int | None = None

    # Optional tags
    tags: list[str] | None = None


# Enable forward reference resolution for recursive model
SnapshotHistoryItem.model_rebuild()
