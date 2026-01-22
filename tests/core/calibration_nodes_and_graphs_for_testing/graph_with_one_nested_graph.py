from typing import ClassVar

from qualibrate.core import GraphParameters, QualibrationGraph, QualibrationLibrary

library = QualibrationLibrary.get_active_library()


class Parameters(GraphParameters):
    targets_name: ClassVar[str] = "qubits_1"
    qubits_1: list[str]


with QualibrationGraph.build(
    name="graph_with_one_nested_graph",
    parameters=Parameters(qubits_1=["q1"]),
) as graph:
    # Create first node
    graph.add_node(library.nodes.get_nocopy("test_node").copy(name="node_1"))
    # Create first subgraph
    with QualibrationGraph.build(
        name="subg",
        parameters=Parameters(qubits_1="q2"),
    ) as subg:
        subg.add_node(library.nodes.get_nocopy("test_node").copy(name="node_2"))
        subg.add_node(library.nodes.get_nocopy("test_node").copy(name="node_3"))
        subg.connect(src="node_2", dst="node_3")
    graph.add_node(subg)
    graph.add_node(library.nodes.get_nocopy("test_node").copy(name="node_4"))
    graph.connect(src="node_1", dst=subg)
    graph.connect(src=subg, dst="node_4")

if __name__ == "__main__":
    result = graph.run()
    print(result)
