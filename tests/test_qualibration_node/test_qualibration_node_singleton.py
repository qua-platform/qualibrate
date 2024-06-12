from qualibrate import QualibrationNode
from qualibrate.node_parameters import NodeParameters


def test_qualibration_node_singleton():
    node = QualibrationNode("test", NodeParameters)

    QualibrationNode._singleton_instance = node

    node2 = QualibrationNode("test2", NodeParameters)

    assert node2 is node
    assert node2.name == "test"

    QualibrationNode._singleton_instance = None

    node3 = QualibrationNode("test3", NodeParameters)

    assert node3 is not node
    assert node3.name == "test3"
