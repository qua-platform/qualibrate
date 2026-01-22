from pydantic import Field

from qualibrate.core import NodeParameters, QualibrationNode
from qualibrate.core.models.outcome import Outcome


class Parameters(NodeParameters):
    qubits: list[str] = Field(default_factory=list)

    float_value: float = 1.0


node = QualibrationNode("second_node", parameters=Parameters())
node.parameters = Parameters()

assert node.name == "second_node"

node.outcomes = {
    target: Outcome.SUCCESSFUL if int(target[1]) % 2 == 0 else Outcome.FAILED
    for target in node.parameters.targets
}
