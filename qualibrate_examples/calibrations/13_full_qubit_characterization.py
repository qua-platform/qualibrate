"""
13 - Full single-qubit characterization

This example demonstrates:
- A complex calibration workflow for characterizing a single qubit.
- Nested graphs to group related calibration steps.
- A combination of sequential execution, branching, and looping.
"""

from qualibrate import GraphParameters, QualibrationGraph, QualibrationLibrary

# Get the active library of pre-defined calibration nodes
library = QualibrationLibrary.get_active_library()


class FullCharacterizationParameters(GraphParameters):
    """Parameters for the full characterization graph."""

    qubits: list[str] = ["q1"]


# Use the context manager to build the main graph
with QualibrationGraph.build(
    "13_full_qubit_characterization",
    parameters=FullCharacterizationParameters(),
    # description="A full characterization routine for a single qubit.",
) as graph:
    # 1. Initial qubit spectroscopy to find the resonance frequency
    spectroscopy_node = library.nodes["01_demo_qubit_spectroscopy"]
    graph.add_node(spectroscopy_node)

    # 2. Gate optimization (nested subgraph)
    # This subgraph calibrates the qubit drive pulses.
    with QualibrationGraph.build(
        "gate_optimization",
        parameters=FullCharacterizationParameters(),
        # description="A subgraph to optimize gate pulses (Rabi and refined Rabi).",
    ) as gate_subgraph:
        # Start with a coarse Rabi experiment
        rabi_node = library.nodes["02_demo_rabi"]
        gate_subgraph.add_node(rabi_node)

        # Retry the Rabi node 2 times.
        gate_subgraph.loop(rabi_node, max_iterations=2)

        # Follow up with a refined Rabi for better accuracy
        refined_rabi_node = library.nodes["04_demo_rabi_refined"]
        gate_subgraph.add_node(refined_rabi_node)
        gate_subgraph.connect(rabi_node, refined_rabi_node)

    # Add the subgraph to the main graph
    graph.add_node(gate_subgraph)
    graph.connect(spectroscopy_node, gate_subgraph)

    # 3. Coherence characterization (nested subgraph)
    # This subgraph measures the qubit's coherence times (T1 and T2*).
    with QualibrationGraph.build(
        "coherence_characterization",
        parameters=FullCharacterizationParameters(),
        # description="A subgraph to measure qubit coherence (T1 and Ramsey).",
    ) as coherence_subgraph:
        t1_node = library.nodes["06_demo_t1"]
        coherence_subgraph.add_node(t1_node)

        ramsey_node = library.nodes["05_demo_ramsey"]
        coherence_subgraph.add_node(ramsey_node)

        # Run T1 and Ramsey in parallel (no connection between them)
        # The orchestrator will run nodes with no dependencies concurrently if possible.

    # Add the coherence subgraph to the main graph
    graph.add_node(coherence_subgraph)
    graph.connect(gate_subgraph, coherence_subgraph)

    # 4. Final gate fidelity assessment
    # Run Randomized Benchmarking to assess the quality of the calibrated gates.
    rb_node = library.nodes["07_demo_randomized_benchmarking"]
    rb_node.name = "final_rb_assessment"
    graph.add_node(rb_node)
    graph.connect(coherence_subgraph, rb_node)

    # 5. Error handling for the entire gate optimization step
    # If the `gate_optimization` subgraph fails completely, we can define a
    # fallback path. For this example, we just connect it to the end.
    # A real implementation might connect to a notification or reset procedure.
    graph.connect_on_failure(gate_subgraph, rb_node)


# The graph is now finalized.
if __name__ == "__main__":
    # It represents a complete, multi-stage calibration routine with nested
    # logic and failure handling.
    print(f"Running graph: {graph.name}...")
    result = graph.run()
    print("Graph execution finished.")
    print(result)
