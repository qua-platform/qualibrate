from qualibrate import NodeParameters, QualibrationNode


class Parameters(NodeParameters):
    qubits: list[str] = []

    int_value: int = 2


node = QualibrationNode("third_node", parameters=Parameters())
node.parameters = Parameters()

assert node.name == "third_node"
