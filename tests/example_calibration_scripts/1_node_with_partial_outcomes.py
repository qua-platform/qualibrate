from qualibrate import NodeParameters, QualibrationNode
from qualibrate.outcome import Outcome


class Parameters(NodeParameters):
    targets_name: str = "qubits"
    qubits: list[str] = ["q0", "q1", "q2"]


node = QualibrationNode("node_part_outcome", parameters_class=Parameters)

print("Running node")
node.machine = {"qubits": [{"qubit1": None}]}
node.results = {"test_val": 42.5}

node.outcomes = {"q0": Outcome.SUCCESSFUL, "q1": Outcome.FAILED}
