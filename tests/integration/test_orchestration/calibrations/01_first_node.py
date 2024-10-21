from pydantic import Field

from qualibrate import NodeParameters, QualibrationNode
from qualibrate.models.outcome import Outcome


class Parameters(NodeParameters):
    qubits: list[str] = Field(default_factory=list)

    str_value: str = "test"


node = QualibrationNode("first_node", parameters=Parameters())
node.parameters = Parameters()

assert node.name == "first_node"

node.outcomes = {
    target: Outcome.SUCCESSFUL for target in node.parameters.targets
}
