
"""
Graph demonstrating operational conditions on failure edges and loop functionality.

Graph structure:
    node (with loop) - calibration node with retry logic
      ├─[SUCCESS]────────────────────> node4
      ├─[FAILED w/ condition True]───> node2 (gets failed targets)
      └─[FAILED w/ condition False]──> node3 (gets no targets)

Expected behavior with qubits=["q1", "q2", "q3", "q4"]:
- q1: succeeds immediately -> goes to node4
- q2, q3, q4: fail -> q2 and q3 go to node2 (condition returns True)
- q4: filtered out by condition (returns False) -> goes to node3 but node3's condition blocks it
"""
from typing import ClassVar

from qualibrate.core import QualibrationGraph, QualibrationLibrary, QualibrationNode, GraphParameters

class Parameters(GraphParameters):
    targets_name: ClassVar[str] = "qubits"
    qubits: list[str]

library = QualibrationLibrary.get_active_library()
USED_NODE = "test_node_with_results"

# Create nodes with simulated behavior
with QualibrationGraph.build(
        "graph_with_operational_condition_and_loop",
        parameters=Parameters(qubits=[f"q{i}" for i in range(1,5)]),
) as graph:
    node = library.nodes.get_nocopy(USED_NODE).copy(name="node")
    node2 = library.nodes.get_nocopy("demo_node_that_fails_targets").copy(name="node2")
    node3 = library.nodes.get_nocopy("demo_node_that_fails_targets").copy(name="node3")
    node4 = library.nodes.get_nocopy("demo_node_that_succeeds_targets").copy(name="node4")

    graph.add_nodes(node, node2, node3, node4)

    graph.loop(
        "node",
        on=lambda node, target: node.namespace.get("calibration_results").get(target).get("fidelity") < 0.7,
        max_iterations=3
    )

    graph.connect_on_failure(
        "node",
        "node2",
        on=lambda node, target: node.namespace.get("calibration_results").get(target).get("error_type") == "retriable"
    )

    graph.connect_on_failure(
        "node",
        "node3",
        on= lambda node, target: True
    )

    # Connect success path
    graph.connect("node", "node4")

if __name__ == "__main__":
    result = graph.run()
    print(f"Run Summary:")
    print(f"  Initial targets: {result.initial_targets}")
    print(f"  Successful targets: {result.successful_targets}")
    print(f"  Failed targets: {result.failed_targets}")
    print(f"  Outcomes: {result.outcomes}")
