from qualibrate import QualibrationNode
from qualibrate.parameters import NodeParameters


def test_qualibration_node_singleton():
    class P(NodeParameters):
        qubits: list[str] = []

    node = QualibrationNode("test", P())

    QualibrationNode._singleton_instance = node

    node2 = QualibrationNode("test2", P())

    assert node2 is node
    assert node2.name == "test"

    QualibrationNode._singleton_instance = None

    node3 = QualibrationNode("test3", P())

    assert node3 is not node
    assert node3.name == "test3"
