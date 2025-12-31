from typing import ClassVar
from qualibrate import GraphParameters, QualibrationGraph, QualibrationLibrary

library = QualibrationLibrary.get_active_library()
USED_NODE = "test_node_mocked_machine"

class Parameters(GraphParameters):
    targets_name: ClassVar[str] = "qubits"
    qubits: list[str]

# Build the main graph
with QualibrationGraph.build(
    "long_graph_sub_graph",
    parameters=Parameters(qubits=[f"q{i}" for i in range(3)]),
) as graph:

    # # Add nodes to the main graph
    graph.add_node(library.nodes.get_nocopy(USED_NODE).copy(name="node_1"))
    for i in range(2, 5):
        graph.add_node(
            library.nodes.get_nocopy(USED_NODE).copy(name=f"node_{i}")
        )
        graph.connect(src=f"node_{i - 1}", dst=f"node_{i}")

    # Build the subgraph that repeats the same structure
    with QualibrationGraph.build(
        "repeated_subgraph",
        parameters=Parameters(qubits=[f"q{i}" for i in range(3)]),
    ) as subg:
        subg.add_node(library.nodes.get_nocopy(USED_NODE).copy(name="node_1"))
        for i in range(2, 5):
            subg.add_node(
                library.nodes.get_nocopy(USED_NODE).copy(name=f"node_{i}")
            )
            subg.connect(src=f"node_{i - 1}", dst=f"node_{i}")

    # Add the subgraph as a node in the main graph
    graph.add_node(subg)

    # Connect last node of main graph to subgraph
    graph.connect(src="node_4", dst=subg)

if __name__ == "__main__":
    # result = graph.run()
    result = graph.serialize()
    print(result)