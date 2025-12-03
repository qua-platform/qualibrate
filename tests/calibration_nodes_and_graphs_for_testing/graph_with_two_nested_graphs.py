from typing import ClassVar

from qualibrate import (
    logger,
)
from qualibrate.orchestration.basic_orchestrator import BasicOrchestrator
from qualibrate import GraphParameters, QualibrationGraph, QualibrationLibrary

library = QualibrationLibrary.get_active_library()

class Parameters(GraphParameters):
    targets_name: ClassVar[str] = "qubits_1"
    qubits_1: list[str]

with QualibrationGraph.build(
        name="graph_with_two_nested_graphs",
        parameters=Parameters(qubits_1=["q1"]),
        orchestrator=BasicOrchestrator(skip_failed=True),
    ) as graph:
    #create first node
    graph.add_node(library.nodes.get_nocopy("test_node").copy(name=f"node_1"))
    #create first subgraph
    with QualibrationGraph.build(
        name="subg",
        parameters=Parameters(qubits_1="q2"),
        orchestrator=BasicOrchestrator(skip_failed=True),
    ) as subg:
        subg.add_node(library.nodes.get_nocopy("test_node").copy(name=f"node_2"))
        subg.add_node(library.nodes.get_nocopy("test_node").copy(name=f"node_3"))
        subg.connect(src="node_2", dst="node_3")
    graph.add_node(subg)
    #second subgraph
    with QualibrationGraph.build(
        name="subg2",
        parameters=Parameters(qubits_1="q3"),
        orchestrator=BasicOrchestrator(skip_failed=True),
    ) as subg2:
        subg2.add_node(library.nodes.get_nocopy("test_node").copy(name=f"node_4"))
        subg2.add_node(library.nodes.get_nocopy("test_node").copy(name=f"node_5"))
        subg2.connect(src="node_4", dst="node_5")
    #doing connections
    graph.add_node(subg2)
    graph.connect(src="node_1", dst=subg)
    graph.connect(src=subg, dst=subg2)
# graph.run()




