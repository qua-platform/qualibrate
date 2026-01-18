"""
Graph demonstrating operational conditions on failure edges and loop functionality.

Graph structure:
    node (with loop) - calibration node with retry logic
      ├─[SUCCESS]────────────────────> node4
      ├─[FAILED w/ condition True]───> node2 (gets q2, q3, q4)
      └─[FAILED w/ condition False]──> node3 (gets nothing)

Features demonstrated:
- Loop on node with lambda condition checking fidelity
- connect_on_failure with lambda condition (always True)
- connect_on_failure with lambda condition (always False)
- Normal connect for success path
"""
from typing import ClassVar

from qualibrate import QualibrationGraph, QualibrationLibrary, GraphParameters
from qualibrate.orchestration.basic_orchestrator import BasicOrchestrator


class Parameters(GraphParameters):
    targets_name: ClassVar[str] = "qubits"
    qubits: list[str]


library = QualibrationLibrary.get_active_library()
USED_NODE = "test_node"

with QualibrationGraph.build(
        "graph_with_operational_condition_and_loop",
        parameters=Parameters(qubits=[f"q{i}" for i in range(7)]),
        orchestrator=BasicOrchestrator(skip_failed=True),
) as graph:
    graph.add_node(library.nodes.get_nocopy(USED_NODE).copy(name="node"))
    graph.add_node(library.nodes.get_nocopy(USED_NODE).copy(name="node2"))
    graph.add_node(library.nodes.get_nocopy(USED_NODE).copy(name="node3"))
    graph.add_node(library.nodes.get_nocopy(USED_NODE).copy(name="node4"))

    # Add loop with fidelity check
    graph.loop(
        "node",
        on=lambda node, target: target == 'q3',
        max_iterations=3
    )

    # Connect failure paths with conditions
    # node2: gets all failed targets (condition always True)
    graph.connect_on_failure("node", "node2", on=lambda x, y: True)

    # node3: gets no failed targets (condition always False)
    graph.connect_on_failure("node", "node3", on=lambda x, y: False)

    # Connect success path
    graph.connect("node", "node4")

if __name__ == "__main__":
    result = graph.run()
    print(result)
