from qualibrate import NodeParameters, QualibrationNode


class Parameters(NodeParameters):
    qubits: list[str] = []
    str_value: str = "test"
    int_value: int = 1
    float_value: float = 1.0


node = QualibrationNode("test_node", parameters=Parameters())
node.parameters = Parameters()

# raise ValueError("msg")
