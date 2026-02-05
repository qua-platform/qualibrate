from enum import Enum

from qualibrate.core import NodeParameters, QualibrationNode
from qualibrate.core.models.outcome import Outcome


class Color(Enum):
    RED = "red"
    GREEN = "green"
    BLUE = "blue"


class Parameters(NodeParameters):
    qubits: list[str] = ["q1", "q2", "q3", "q4"]
    str_value: str = "test"
    int_value: int = 1
    float_value: float = 1
    random_color: Color = Color.BLUE


node = QualibrationNode("test_node222", parameters=Parameters())


@node.run_action()
def node_runs_indication(node: QualibrationNode):
    node.log("node is running")
    node.outcomes["q1"] = Outcome.SUCCESSFUL
    node.outcomes["q2"] = Outcome.FAILED
    raise Exception("test exception")
    node.save()
    return node.outcomes
