from qualibrate import QualibrationGraph, QualibrationLibrary, QualibrationNode

library = QualibrationLibrary.get_active_library()
USED_NODE = "test_node"


def check_fidelity(node: QualibrationNode, target: str):
    while True:
        yield node.results[target]["fidelity"] < 0.95


with QualibrationGraph.build(
    "graph_with_loop",
) as graph:
    graph.add_node(library.nodes.get_nocopy(USED_NODE).copy(name="node"))
    graph.add_node(library.nodes.get_nocopy(USED_NODE).copy(name="node2"))
    graph.loop(
        "node",
        on=check_fidelity,
        max_iterations=10,
    )
    graph.connect("node", "node2")

if __name__ == "__main__":
    result = graph.run()
    print(result)
