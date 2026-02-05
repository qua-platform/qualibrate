from qualibrate import GraphParameters
from qualibrate.core import QualibrationGraph, QualibrationLibrary

library = QualibrationLibrary.get_active_library()
USED_NODE = "test_node"

class AdaptiveRamseyParameters(GraphParameters):
    """Parameters for the adaptive Ramsey graph."""
    qubits: list[str] = ["q1","q2","q3","q4"]

with QualibrationGraph.build(
    "graph_with_loop",
    parameters= AdaptiveRamseyParameters(),
) as graph:
    graph.add_node(library.nodes.get_nocopy(USED_NODE).copy(name="node"))
    graph.add_node(library.nodes.get_nocopy(USED_NODE).copy(name="node2"))
    graph.add_node(library.nodes.get_nocopy(USED_NODE).copy(name="node3"))
    graph.loop(
        "node",
        max_iterations=10,
    )
    graph.connect("node", "node2")

if __name__ == "__main__":
    result = graph.run()
    print(result)
