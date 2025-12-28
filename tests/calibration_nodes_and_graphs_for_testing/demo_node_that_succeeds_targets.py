from qualibrate import NodeParameters, QualibrationNode
from qualibrate.models.outcome import Outcome


class Parameters(NodeParameters):
    qubits: list[str] = ["q1", "q2", "q3", "q4"]
    str_value: str = "test"
    int_value: int = 1
    float_value: float = 1.0


node = QualibrationNode(
    "demo_node_that_succeeds_targets", parameters=Parameters()
)


@node.run_action()
def node_runs_indication(node: QualibrationNode):
    node.log("node is running")
    for target in node.parameters.targets:
        node.outcomes[target] = Outcome.SUCCESSFUL
    return node.outcomes
