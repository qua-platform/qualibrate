"""
11 - Tune-up with retries

This example demonstrates:
- `loop`: How to automatically retry a calibration node.
- `connect_on_failure`: How to define a fallback path for error handling.
"""
from qualibrate import GraphParameters, QualibrationGraph, QualibrationLibrary

# Get the active library of pre-defined calibration nodes
library = QualibrationLibrary.get_active_library()


class TuneupParameters(GraphParameters):
    """Parameters for the tune-up graph, specifying the qubits to be used."""
    qubits: list[str] = ["q1"]


# Use the context manager to build the graph
with QualibrationGraph.build(
    "11_tuneup_with_retries",
    parameters=TuneupParameters(),
    # description="A graph that retries a Rabi experiment and has a failure path.",
) as graph:
    # 1. Initial Rabi experiment
    # We will try to run a Rabi experiment. If it fails, we want to retry.
    rabi_node = library.nodes["02_demo_rabi"]
    rabi_node.name = "rabi_with_retries"
    graph.add_node(rabi_node)

    # Use loop to retry the node up to 3 times.
    graph.loop(rabi_node, max_iterations=3)

    # 2. Refined Rabi experiment (success path)
    # This node will only run if the initial Rabi experiment succeeds.
    refined_rabi_node = library.nodes["04_demo_rabi_refined"]
    graph.add_node(refined_rabi_node)
    graph.connect(rabi_node, refined_rabi_node)

    # 3. Ramsey experiment (success path)
    # This node will run after the refined Rabi, continuing the successful path.
    ramsey_node = library.nodes["05_demo_ramsey"]
    graph.add_node(ramsey_node)
    graph.connect(refined_rabi_node, ramsey_node)

    # 4. Failure handling node
    # This is a placeholder for a failure-handling procedure. It could be a
    # simple wait, a notification, or another calibration to reset the qubit.
    # For this example, we use a simple T1 measurement as a placeholder.
    failure_handler_node = library.nodes["06_demo_t1"]
    failure_handler_node.name = "failure_handler"
    graph.add_node(failure_handler_node)

    # Use connect_on_failure to specify that if 'rabi_with_retries' fails
    # after all retries, the graph should proceed to the failure handler.
    graph.connect_on_failure(rabi_node, failure_handler_node)

# The graph is now finalized.
if __name__ == "__main__":
    # When executed, if `rabi_with_retries` fails, it will be retried 3 times.
    # If it still fails, the execution will follow the edge to `failure_handler`.
    # If it succeeds, execution proceeds to `refined_rabi_node` and then `ramsey_node`.
    print(f"Running graph: {graph.name}...")
    result = graph.run()
    print("Graph execution finished.")
    print(result)
