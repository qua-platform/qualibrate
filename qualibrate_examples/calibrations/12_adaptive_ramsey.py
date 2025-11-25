"""
12 - Adaptive Ramsey experiment

This example demonstrates:
- `loop` with a condition function to create an adaptive experiment.
- The graph will repeatedly run a Ramsey experiment, adjusting its parameters
  until a desired precision is met.
"""

from qualibrate import (
    GraphParameters,
    QualibrationGraph,
    QualibrationLibrary,
)

# Get the active library of pre-defined calibration nodes
library = QualibrationLibrary.get_active_library()

# Define the desired precision for the Ramsey fit
MAX_ITERATIONS = 5


class AdaptiveRamseyParameters(GraphParameters):
    """Parameters for the adaptive Ramsey graph."""

    qubits: list[str] = ["q1"]
    initial_ramsey_duration: float = 10.0  # Initial duration for the Ramsey experiment
    duration_increment: float = 5.0  # How much to increase duration each iteration


# Use the context manager to build the graph
with QualibrationGraph.build(
    "12_adaptive_ramsey",
    parameters=AdaptiveRamseyParameters(),
    # description="An adaptive Ramsey experiment to reach a target frequency precision.",
) as graph:
    # Get the Ramsey node from the library
    ramsey_node = library.nodes["05_demo_ramsey"]
    ramsey_node.set_parameters(duration=graph.parameters.initial_ramsey_duration)
    graph.add_node(ramsey_node)

    # Set up the adaptive loop on the Ramsey node
    graph.loop(ramsey_node, max_iterations=MAX_ITERATIONS)

# The graph is now finalized.
if __name__ == "__main__":
    # When executed, it will run the `ramsey_node` repeatedly. After each run,
    # the `should_repeat_ramsey` function is called. The loop continues until
    # the function returns False (either precision is met or max iterations are reached).
    print(f"Running graph: {graph.name}...")
    result = graph.run()
    print("Graph execution finished.")
    print(result)
