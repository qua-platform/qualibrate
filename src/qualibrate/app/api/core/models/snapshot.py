from collections.abc import Sequence
from typing import Annotated, Any, Literal

from pydantic import AwareDatetime, BaseModel, ConfigDict, Field, computed_field

from qualibrate.app.api.core.models.base import ModelWithIdCreatedAt
from qualibrate.app.api.core.types import IdType
from qualibrate.core.models.execution_type import ExecutionType


class QubitOutcome(BaseModel):
    """Outcome status for a single qubit/target in a workflow aggregate.

    This model is used ONLY for aggregated workflow statistics in
    SnapshotHistoryItem.outcomes. It provides failure tracking by
    recording which node a qubit failed on.

    Note: Raw outcomes stored in individual snapshot data (SnapshotData.outcomes)
    use a simpler string format: {"q1": "successful", "q2": "failed"}
    from the Outcome enum. The QubitOutcome model is computed at query time
    when building workflow aggregates.

    Attributes:
        status: "success" or "failure" (note: different from Outcome enum which
            uses "successful"/"failed")
        failed_on: For failures, the name of the node where the qubit failed.
            None for successful outcomes.
    """

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


class SimplifiedSnapshotWithMetadataAndOutcomes(SimplifiedSnapshotWithMetadata):
    """Extended snapshot model that includes outcomes data for workflow aggregation.

    This model is used when building workflow trees with grouped=true to enable
    proper outcomes aggregation from child nodes.
    """

    outcomes: dict[str, Any] | None = None


class SnapshotData(BaseModel):
    """Data associated with a snapshot.

    Attributes:
        quam: QuAM machine state (alias: machine)
        parameters: Calibration node parameters
        results: Calibration results
        outcomes: Raw outcomes for individual targets/qubits.
            Format: {"q1": "successful", "q2": "failed"}
            Values are from the Outcome enum ("successful"/"failed").

            Note: This differs from SnapshotHistoryItem.outcomes which uses
            the QubitOutcome model with status/failed_on for workflow aggregates.
    """

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
    # Aggregated outcomes for workflow snapshots (populated when children are loaded)
    # Format: {"q1": {"status": "success"}, "q2": {"status": "failure", "failed_on": "cal_node"}}
    aggregated_outcomes: dict[str, QubitOutcome] | None = None


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
        - outcomes = aggregated outcomes from all children (QubitOutcome format)
        - nodes_completed, nodes_total, qubits_completed, qubits_total populated

    Outcomes Format Difference:
        The `outcomes` field here uses QubitOutcome objects:
            {"q1": {"status": "success"}, "q2": {"status": "failure", "failed_on": "cal_node"}}
        This differs from raw snapshot data (SnapshotData.outcomes) which uses strings:
            {"q1": "successful", "q2": "failed"}
    """

    parents: list[IdType]
    metadata: SnapshotHistoryMetadata
    type_of_execution: ExecutionType = ExecutionType.node

    # Workflow-only fields: nested items
    items: list["SnapshotHistoryItem"] | None = None

    # Workflow aggregate statistics (only populated for workflows when grouped=true)
    # Note: outcomes uses QubitOutcome format, NOT the raw string format from SnapshotData
    outcomes: dict[str, QubitOutcome] | None = None
    nodes_completed: int | None = None
    nodes_total: int | None = None
    qubits_completed: int | None = None
    qubits_total: int | None = None

    # Optional tags
    tags: list[str] | None = None


# Enable forward reference resolution for recursive model
SnapshotHistoryItem.model_rebuild()
