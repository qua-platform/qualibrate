from enum import Enum

from qualibrate import NodeParameters, QualibrationNode

class FakeGateFidelity:
    def __init__(self, averaged: float):
        self.averaged = averaged

class FakeQubit:
    def __init__(self, name: str, gate_fidelity: FakeGateFidelity | None = None):
        self.name = name
        self.gate_fidelity = gate_fidelity

class FakeMachine:
    def __init__(self):
        # qubits dict
        self.qubits = {
            "q1": FakeQubit("q1", FakeGateFidelity(0.99)),
            "q2": FakeQubit("q2", FakeGateFidelity(0.95)),
            "q3": FakeQubit("q3")  # no gate fidelity
        }
        # active_qubits list
        self.active_qubits = [
            self.qubits["q1"],
            self.qubits["q3"]
        ]

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

node = QualibrationNode("test_node_mocked_machine", parameters=Parameters(), machine=FakeMachine()
)


@node.run_action()
def node_runs_indication(node: QualibrationNode):

    node.log("node is running")
    node.machine = FakeMachine()
    result = node.serialize()
    print(result)
    return result