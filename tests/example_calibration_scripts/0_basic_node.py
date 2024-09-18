from qualibrate import NodeParameters, QualibrationNode


class Parameters(NodeParameters):
    qubits: list[str] = []


node = QualibrationNode("basic_node", parameters=Parameters())

print("Running node")
node.machine = {"qubits": [{"qubit1": None}]}
node.results = {"test_val": 42.5}

node.save()
