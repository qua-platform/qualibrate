from typing import ClassVar

from qualibrate.core import GraphParameters, QualibrationGraph, QualibrationLibrary

library = QualibrationLibrary.get_active_library()

USED_NODE = "test_node_mocked_machine"


class Parameters(GraphParameters):
    targets_name: ClassVar[str] = "qubits"
    qubits: list[str]


with QualibrationGraph.build(
    "long_graph",
    parameters=Parameters(qubits=[f"q{i}" for i in range(3)]),
) as graph:
    graph.add_node(library.nodes.get_nocopy(USED_NODE).copy(name="node_1"))
    for i in range(2, 5):
        graph.add_node(
            library.nodes.get_nocopy(USED_NODE).copy(name=f"node_{i}")
        )
        graph.connect(src=f"node_{i - 1}", dst=f"node_{i}")

if __name__ == "__main__":
    # result = graph.run()
    result = graph.serialize()
    print(result)
