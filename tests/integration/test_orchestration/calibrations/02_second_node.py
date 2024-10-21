from pydantic import Field

from qualibrate import NodeParameters, QualibrationNode
from qualibrate.models.outcome import Outcome


class Parameters(NodeParameters):
    qubits: list[str] = Field(default_factory=list)

    float_value: float = 1.0


node = QualibrationNode("second_node", parameters=Parameters())
node.parameters = Parameters()

assert node.name == "second_node"

node.outcomes = {
    target: Outcome.SUCCESSFUL if i % 2 else Outcome.FAILED
    for i, target in enumerate(node.parameters.targets)
}
