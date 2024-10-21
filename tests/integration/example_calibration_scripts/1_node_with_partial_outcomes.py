from typing import ClassVar

from pydantic import Field

from qualibrate import NodeParameters, QualibrationNode
from qualibrate.models.outcome import Outcome


class Parameters(NodeParameters):
    targets_name: ClassVar[str] = "qubits"
    qubits: list[str] = Field(default_factory=lambda: ["q0", "q1", "q2"])


node = QualibrationNode("node_part_outcome", parameters=Parameters())

print("Running node")
node.machine = {"qubits": [{"qubit1": None}]}
node.results = {"test_val": 42.5}

node.outcomes = {"q0": Outcome.SUCCESSFUL, "q1": Outcome.FAILED}
