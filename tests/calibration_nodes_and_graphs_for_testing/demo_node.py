from pydantic import Field
from quam.components import BasicQuam
from qualibrate import NodeParameters, QualibrationNode


class Parameters(NodeParameters):
    qubits: list[str] = Field(default_factory=list)
    str_value: str = "test"
    int_value: int = 1
    float_value: float = 1.0


node = QualibrationNode("test_node", parameters=Parameters())
node = QualibrationNode("test_node", parameters=Parameters(),machine = BasicQuam().load())
node.parameters = Parameters()
node.machine = BasicQuam.load()


@node.run_action()
def node_runs_indication(node: QualibrationNode):
    # node.log("node is running")
    # node.log("connect machine")
    # node.machine = BasicQuam.load()
    # node.log("connected machine")
    # node.log(node.machine)
    data = node.serialize()
    print(data)
    return data
