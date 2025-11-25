from qualibrate import GraphParameters, QualibrationGraph, QualibrationLibrary
from qualibrate.orchestration.basic_orchestrator import BasicOrchestrator

library = QualibrationLibrary.get_active_library()


class Parameters(GraphParameters):
    qubits: list[str] = ["q1", "q2"]


"QualibrationGraph("

with QualibrationGraph.build(
    "test_compose_graph", parameters=Parameters(), orchestrator=BasicOrchestrator()
) as graph:
    rabi_node = library.nodes["02_demo_rabi"]
    rabi_node.set_parameters(duration=12.0)
    graph.add_node(rabi_node)

    with QualibrationGraph.build(
        "subgraph", parameters=Parameters(), orchestrator=BasicOrchestrator()
    ) as subgraph:
        ramsey_node = library.nodes["05_demo_ramsey"]
        subgraph.add_node(ramsey_node)

        rb_node = library.nodes["07_demo_randomized_benchmarking"]
        subgraph.add_node(rb_node)

        subgraph.connect(ramsey_node, rb_node)

    graph.add_node(subgraph)

    graph.connect(rabi_node, subgraph)

    rb_node2 = library.nodes["07_demo_randomized_benchmarking"]
    rb_node2.set_parameters(duration=5.0)
    graph.add_node(rb_node2)
    graph.connect(subgraph, rb_node2)

    graph.connect(rb_node2, rabi_node)

graph.run()
