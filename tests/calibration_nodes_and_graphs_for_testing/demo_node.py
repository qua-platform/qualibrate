from qualibrate import NodeParameters, QualibrationNode
from qualibrate.models.outcome import Outcome


class Parameters(NodeParameters):
    qubits: list[str] = ["q1", "q2", "q3", "q4"]
    str_value: str = "test"
    int_value: int = 1
    float_value: float = 1.0


node = QualibrationNode("test_node", parameters=Parameters())
node.parameters = Parameters(qubits=["q1", "q2", "q3", "q4"])


@node.run_action()
def node_runs_indication(node: QualibrationNode):
    node.log("node is running")
    node.outcomes["q1"] = "successful"
    node.outcomes["q2"] = Outcome.FAILED
    return node.outcomes
