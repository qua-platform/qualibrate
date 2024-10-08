from qualibrate import QualibrationNode, NodeParameters


class Parameters(NodeParameters):
    qubits: list[str] = []

    sampling_points: int = 100


node = QualibrationNode(
    name="forth_node",
    parameters=Parameters(),
    description="Description.",
)

raise ValueError("Execution error")
