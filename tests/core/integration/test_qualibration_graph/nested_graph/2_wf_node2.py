from pydantic import Field

from qualibrate.core import NodeParameters, QualibrationNode
from qualibrate.core.models.outcome import Outcome


class Parameters(NodeParameters):
    qubits: list[str] = Field(default_factory=list)


node = QualibrationNode(
    name="wf_node2",
    parameters=Parameters(),
)

node.outcomes = {t: Outcome.SUCCESSFUL if t.startswith("s") else Outcome.FAILED for t in node.parameters.targets}
