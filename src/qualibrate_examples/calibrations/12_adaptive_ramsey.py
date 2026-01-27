"""
12 - Adaptive Ramsey experiment

This example demonstrates:
- `loop` with a simple condition function to create an adaptive experiment.
- The graph will repeatedly run the same Ramsey node until the T2* estimate
  beats a target value.
"""

from qualibrate.core import (
    GraphParameters,
    QualibrationGraph,
    QualibrationLibrary,
    QualibrationNode,
)

# Get the active library of pre-defined calibration nodes
library = QualibrationLibrary.get_active_library()

MAX_ITERATIONS = 5
# Success probability is ~30% because T2* is uniform in [8, 12] μs
TARGET_T2_STAR_US = 10.8


class AdaptiveRamseyParameters(GraphParameters):
    """Parameters for the adaptive Ramsey graph."""

    qubits: list[str] = ["q1"]
    target_t2_star_us: float = TARGET_T2_STAR_US


def should_repeat_ramsey(node: QualibrationNode, target: str) -> bool:
    """Retry until T2* crosses the target."""
    fit = node.results.get("fit_results", {}).get(target, {})
    t2_star = fit.get("t2_star")
    if not fit.get("success") or t2_star is None:
        node.log(f"{target}: fit failed or missing T2*; retrying.")
        return True

    t2_us = t2_star / 1e-6
    target_us = graph.parameters.target_t2_star_us
    if t2_us < target_us:
        node.log(
            f"{target}: T2* = {t2_us:.2f} μs < target {target_us:.2f} μs; retrying."
        )
        return True

    node.log(f"{target}: T2* = {t2_us:.2f} μs meets target; stopping loop.")
    return False


# Use the context manager to build the graph
with QualibrationGraph.build(
    "12_adaptive_ramsey",
    parameters=AdaptiveRamseyParameters(),
    # description="An adaptive Ramsey experiment that repeats until T2* meets the target.",
) as graph:
    # Get the Ramsey node from the library
    ramsey_node = library.nodes["05_demo_ramsey"]
    graph.add_node(ramsey_node)

    # Set up the adaptive loop on the Ramsey node
    graph.loop(
        ramsey_node,
        on=should_repeat_ramsey,
        max_iterations=MAX_ITERATIONS,
    )

# The graph is now finalized.
if __name__ == "__main__":
    # When executed, it will run the `ramsey_node` repeatedly. After each run,
    # the conditional function checks the detuning precision and optionally
    # extends the Ramsey window before another iteration.
    print(f"Running graph: {graph.name}...")
    result = graph.run()
    print("Graph execution finished.")
    print(result)
