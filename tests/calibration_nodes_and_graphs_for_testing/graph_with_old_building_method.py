from qualibrate.orchestration.basic_orchestrator import BasicOrchestrator
from qualibrate.parameters import GraphParameters
from qualibrate.qualibration_graph import QualibrationGraph
from qualibrate.qualibration_library import QualibrationLibrary
USED_NODE = "test_node"
library = QualibrationLibrary.get_active_library()


class Parameters(GraphParameters):
    qubits: list[str]


nodes = {
    "node1": library.nodes.get_nocopy(USED_NODE).copy(name="node1"),
    "node2": library.nodes.get_nocopy(USED_NODE).copy(name="node2"),
    "node3": library.nodes.get_nocopy(USED_NODE).copy(name="node3"),
}

g = QualibrationGraph(
    name="graph_with_old_building_method",
    parameters=Parameters(qubits=[]),
    nodes=nodes,
    connectivity=[("node1", "node2")],
    orchestrator=BasicOrchestrator(skip_failed=True),
)
# g.run()
