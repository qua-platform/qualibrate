from qualibrate import NodeParameters, QualibrationNode


class Parameters(NodeParameters):
    pass


node = QualibrationNode("basic_node", parameters_class=Parameters)

print("Running node")
node.machine = {"qubits": [{"qubit1": None}]}
node.results = {"test_val": 42.5}

node.save()
