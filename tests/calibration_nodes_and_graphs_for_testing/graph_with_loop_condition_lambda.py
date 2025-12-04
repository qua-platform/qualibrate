from qualibrate import QualibrationGraph, QualibrationLibrary

library = QualibrationLibrary.get_active_library()
USED_NODE = "test_node"

with QualibrationGraph.build(
    "graph_with_loop",
) as graph:
    graph.add_node(library.nodes.get_nocopy(USED_NODE).copy(name="node"))
    graph.add_node(library.nodes.get_nocopy(USED_NODE).copy(name="node2"))
    graph.loop(
        "node",
        on=lambda node, target: node.results[target]["fidelity"] < 0.95,
    )
    graph.connect("node", "node2")

if __name__ == "__main__":
    result = graph.run()
    print(result)
