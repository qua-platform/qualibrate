"""
10 - Basic graph composition

This example demonstrates:
- Building a graph using the context manager (`with QualibrationGraph.build(...)`).
- Getting nodes from the library (which are automatically copied).
- Creating a nested graph (subgraph).
- Connecting nodes and subgraphs.
"""

from qualibrate import GraphParameters, QualibrationGraph, QualibrationLibrary

# Get the active library of pre-defined calibration nodes
library = QualibrationLibrary.get_active_library()


class TuneupParameters(GraphParameters):
    """Parameters for the tune-up graph, specifying the qubits to be used."""

    qubits: list[str] = ["q1"]


# Use the context manager to build the graph
with QualibrationGraph.build(
    "10_basic_graph_composition",
    parameters=TuneupParameters(),
    # description="A basic example of graph composition with a nested subgraph.",
) as graph:
    # Get nodes from the library. A copy is automatically created.
    rabi_node = library.nodes["02_demo_rabi"]
    rabi_node.set_parameters(duration=12.0)
    graph.add_node(rabi_node)

    # Create a nested subgraph, also using the context manager
    with QualibrationGraph.build(
        "coherence_characterization",
        parameters=TuneupParameters(),
        # description="A subgraph to measure qubit coherence (T1 and T2*).",
    ) as subgraph:
        # Get and add nodes to the subgraph
        ramsey_node = library.nodes["05_demo_ramsey"]
        subgraph.add_node(ramsey_node)

        t1_node = library.nodes["06_demo_t1"]
        subgraph.add_node(t1_node)

        # Connect nodes within the subgraph
        subgraph.connect(ramsey_node, t1_node)

    # Add the subgraph as a node in the main graph
    graph.add_node(subgraph)

    # Connect the initial Rabi node to the coherence subgraph
    graph.connect(rabi_node, subgraph)

    # Add another node to the main graph
    rb_node = library.nodes["07_demo_randomized_benchmarking"]
    graph.add_node(rb_node)

    # Connect the subgraph to the final RB node
    graph.connect(subgraph, rb_node)

# The graph is now finalized and ready to be executed.
if __name__ == "__main__":
    # To run this graph, you would typically use a QualibrationRunner,
    # but for demonstration purposes, we can execute it directly.
    print(f"Running graph: {graph.name}...")
    result = graph.run()
    print("Graph execution finished.")
    print(result)
