from typing import Optional

from pydantic import Field

from qualibrate import NodeParameters, QualibrationNode
from enum import Enum

from qualibrate.models.outcome import Outcome


class Color(Enum):
    RED = "red"
    GREEN = "green"
    BLUE = "blue"

class Parameters(NodeParameters):
    qubits: list[str] = Field(default_factory=list)
    str_value: str = "test"
    int_value: int = 1
    float_value: float = 1
    random_color: Color = Color.BLUE

node = QualibrationNode("test_node", parameters=Parameters())


@node.run_action()
def node_runs_indication(node: QualibrationNode):
    node.log("node is running")
