from qualibrate import QualibrationNode, NodeParameters


class Parameters(NodeParameters):
    pass


node = QualibrationNode("basic_node", parameters_class=Parameters)

print("Running node")
node.machine = {"qubits": [{"qubit1": None}]}

node.save()
