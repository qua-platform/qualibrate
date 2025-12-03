from typing import ClassVar

from qualibrate import GraphParameters, QualibrationGraph, QualibrationLibrary

library = QualibrationLibrary.get_active_library()


class Parameters(GraphParameters):
    targets_name: ClassVar[str] = "qubits_1"
    qubits_1: list[str]


with QualibrationGraph.build(
    "long_graph",
    parameters=Parameters(qubits_1=[f"q{i}" for i in range(3)]),
) as graph:
    graph.add_node(library.nodes.get_nocopy("test_node").copy(name="node_1"))
    for i in range(2, 150):
        graph.add_node(
            library.nodes.get_nocopy("test_node").copy(name=f"node_{i}")
        )
        graph.connect(src=f"node_{i - 1}", dst=f"node_{i}")

if __name__ == "__main__":
    a = graph.run()
    print(a)
