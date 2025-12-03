from typing import ClassVar

from qualibrate import (
    logger,
)
from qualibrate.orchestration.basic_orchestrator import BasicOrchestrator
from qualibrate import GraphParameters, QualibrationGraph, QualibrationLibrary

library = QualibrationLibrary.get_active_library()

# Use the context manager to build the graph
with QualibrationGraph.build(
    "graph_with_loop",
    # description="An adaptive Ramsey experiment that repeats until T2* meets the target.",
) as graph:
    # Get the Ramsey node from the library
    graph.add_node(library.nodes.get_nocopy("test_node").copy(name="node"))
    graph.add_node(library.nodes.get_nocopy("test_node").copy(name="node2"))
    graph.loop(
        "node",
        max_iterations=10,
    )
    graph.connect("node", "node2")

# graph.run()

    # Set up the adaptive loop on the Ramsey node

