from qualibrate.core.orchestration.basic_orchestrator import BasicOrchestrator
from qualibrate.core.parameters import GraphParameters
from qualibrate.core.qualibration_graph import QualibrationGraph
from qualibrate.core.qualibration_library import QualibrationLibrary

library = QualibrationLibrary.get_active_library()


class Parameters(GraphParameters):
    qubits: list[str]


nodes = {
    "wf_node1": library.nodes["wf_node1"],
    "wf_node2": library.nodes["wf_node2"].copy(),
    "wf_node3": library.nodes["wf_node2"].copy(name="wf_node3"),
}

g = QualibrationGraph(
    name="wf1",
    parameters=Parameters(qubits=[]),
    nodes=nodes,
    connectivity=[("wf_node1", "wf_node3")],
    orchestrator=BasicOrchestrator(skip_failed=True),
)
