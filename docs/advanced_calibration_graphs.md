# Advanced Calibration Graphs

## Introduction

QUAlibrate's advanced calibration graph features enable sophisticated calibration workflows through a modern context manager API, adaptive looping, failure handling, and hierarchical graph composition. These features build upon the basic [calibration graphs](calibration_graphs.md) functionality and provide powerful tools for creating robust, complex calibration routines.

This guide assumes you have access to the demo calibration nodes (01-07) that are automatically installed with QUAlibrate as part of the demo project.

## The Context Manager API

The recommended way to create calibration graphs is using the `QualibrationGraph.build()` context manager. This API provides a clean, intuitive syntax for graph construction and ensures proper graph finalization.

### Basic Usage

```python
from qualibrate import QualibrationGraph, QualibrationLibrary, GraphParameters

library = QualibrationLibrary.get_active_library()

class TuneupParameters(GraphParameters):
    qubits: list[str] = ["q1"]

# Build the graph using the context manager
with QualibrationGraph.build(
    "my_calibration_graph",
    parameters=TuneupParameters(),
) as graph:
    # Get nodes from the library (automatically copied)
    rabi_node = library.nodes["02_demo_rabi"]
    ramsey_node = library.nodes["05_demo_ramsey"]

    # Add nodes to the graph
    graph.add_node(rabi_node)
    graph.add_node(ramsey_node)

    # Connect nodes
    graph.connect(rabi_node, ramsey_node)

# Graph is now finalized and ready to run
if __name__ == "__main__":
    result = graph.run(qubits=["q1", "q2"])
```

### How It Works

The context manager handles the graph lifecycle automatically:

1. **Building Phase**: When you enter the `with` block, the graph is in building mode. You can add nodes, create connections, and configure loops.
2. **Finalization**: When exiting the `with` block, the graph is automatically finalized. This validates the graph structure, ensures all nodes are properly copied from the library, and builds the internal execution graph.
3. **Execution**: After the context manager exits, the graph is ready to run.

!!! note "Advantages of the Context Manager"
    - **Clear lifecycle**: Building and execution phases are visually separated
    - **Automatic finalization**: No need to manually call finalization methods
    - **Error safety**: Prevents accidental graph modification after finalization
    - **Library safety**: Ensures nodes from the library are always copied, never directly modified

## Graph Composition and Nested Subgraphs

Complex calibration workflows can be organized hierarchically by nesting graphs within graphs. A `QualibrationGraph` can be added as a node in another graph, creating a parent-child relationship.

### Creating Nested Subgraphs

```python
from qualibrate import QualibrationGraph, QualibrationLibrary, GraphParameters

library = QualibrationLibrary.get_active_library()

class TuneupParameters(GraphParameters):
    qubits: list[str] = ["q1"]

# Build the main graph
with QualibrationGraph.build(
    "full_calibration",
    parameters=TuneupParameters(),
) as graph:
    # Add an initial node
    rabi_node = library.nodes["02_demo_rabi"]
    graph.add_node(rabi_node)

    # Create a nested subgraph for coherence measurements
    with QualibrationGraph.build(
        "coherence_characterization",
        parameters=TuneupParameters(),
    ) as subgraph:
        # Add nodes to the subgraph
        ramsey_node = library.nodes["05_demo_ramsey"]
        t1_node = library.nodes["06_demo_t1"]
        subgraph.add_node(ramsey_node)
        subgraph.add_node(t1_node)

        # Connect nodes within the subgraph
        subgraph.connect(ramsey_node, t1_node)

    # Add the subgraph as a node in the main graph
    graph.add_node(subgraph)

    # Connect the initial node to the subgraph
    graph.connect(rabi_node, subgraph)

    # Add a final node
    rb_node = library.nodes["07_demo_randomized_benchmarking"]
    graph.add_node(rb_node)
    graph.connect(subgraph, rb_node)
```

### Benefits of Nested Subgraphs

- **Logical organization**: Group related calibration steps together
- **Reusability**: Create subgraphs that can be used in multiple parent graphs
- **Clarity**: Break complex workflows into manageable, understandable pieces
- **Atomic execution**: The subgraph executes as a single unit from the parent graph's perspective

## Looping and Adaptive Calibration

Looping allows a calibration node to be executed multiple times, enabling retry logic and adaptive calibration strategies. QUAlibrate supports both simple iteration limits and sophisticated conditional loops.

### Simple Retry Loops

Use `max_iterations` to retry a node a fixed number of times:

```python
with QualibrationGraph.build(
    "tuneup_with_retries",
    parameters=TuneupParameters(),
) as graph:
    rabi_node = library.nodes["02_demo_rabi"]
    graph.add_node(rabi_node)

    # Retry the node up to 3 times
    graph.loop(rabi_node, max_iterations=3)

    # Continue with the rest of the graph
    ramsey_node = library.nodes["05_demo_ramsey"]
    graph.add_node(ramsey_node)
    graph.connect(rabi_node, ramsey_node)
```

The node will execute repeatedly until either:
- It succeeds on all targets, or
- The maximum number of iterations is reached

### Conditional Loops

For adaptive calibration, you can provide a condition function that determines whether to continue iterating based on the calibration results:

```python
from qualibrate import QualibrationNode

def should_repeat_ramsey(node: QualibrationNode, target: str) -> bool:
    """Retry until T2* crosses the target threshold."""
    fit = node.results.get("fit_results", {}).get(target, {})
    t2_star = fit.get("t2_star")

    # Retry if fit failed or T2* is below target
    if not fit.get("success") or t2_star is None:
        return True

    t2_us = t2_star / 1e-6
    target_us = graph.parameters.target_t2_star_us
    if t2_us < target_us:
        return True

    return False  # Target met, stop looping

with QualibrationGraph.build(
    "adaptive_ramsey",
    parameters=AdaptiveRamseyParameters(),
) as graph:
    ramsey_node = library.nodes["05_demo_ramsey"]
    graph.add_node(ramsey_node)

    # Set up adaptive loop with condition function
    graph.loop(
        ramsey_node,
        on=should_repeat_ramsey,
        max_iterations=5,
    )
```

### Condition Function Signature

Condition functions must accept two parameters:
- `node: QualibrationNode` - The node instance, allowing access to `node.results`
- `target: str` - The specific target (e.g., qubit) being evaluated

The function should return:
- `True` if the target should be calibrated again in another iteration
- `False` if calibration for this target is complete

!!! note "Per-Target Looping"
    Condition functions are called separately for each target. This enables per-target adaptive logic where some qubits may continue iterating while others are finished.

### Combining Conditions and Max Iterations

When both a condition function and `max_iterations` are specified, the loop continues while:
- The condition function returns `True` for any target, AND
- The iteration count has not reached `max_iterations`

This provides a safety bound on adaptive algorithms while still allowing sophisticated logic.

## Failure Handling

Real-world calibration workflows must account for failures. QUAlibrate provides `connect_on_failure()` to define explicit failure paths in your calibration graph.

### Basic Failure Handling

```python
with QualibrationGraph.build(
    "tuneup_with_failure_handling",
    parameters=TuneupParameters(),
) as graph:
    # Primary calibration path
    rabi_node = library.nodes["02_demo_rabi"]
    graph.add_node(rabi_node)
    graph.loop(rabi_node, max_iterations=3)

    # Success path: continue with refined Rabi
    refined_rabi_node = library.nodes["04_demo_rabi_refined"]
    graph.add_node(refined_rabi_node)
    graph.connect(rabi_node, refined_rabi_node)

    # Failure path: run diagnostic node
    failure_handler_node = library.nodes["06_demo_t1"]
    failure_handler_node.name = "failure_diagnostics"
    graph.add_node(failure_handler_node)

    # If rabi_node fails after all retries, go to failure handler
    graph.connect_on_failure(rabi_node, failure_handler_node)
```

### How Failure Handling Works

When a node completes execution:
- **Success outcome**: Targets that succeeded follow edges created with `connect()`
- **Failure outcome**: Targets that failed follow edges created with `connect_on_failure()`

This allows you to:
- Define recovery procedures for failed calibrations
- Route failed targets to diagnostic nodes
- Implement fallback calibration strategies
- Ensure the graph continues executing even when some calibrations fail

### Combining Loops and Failure Handling

Failure edges are only followed after a node completes all its loop iterations:

```python
with QualibrationGraph.build("robust_calibration", parameters=params) as graph:
    risky_node = library.nodes["01_demo_qubit_spectroscopy"]
    graph.add_node(risky_node)

    # Try up to 3 times
    graph.loop(risky_node, max_iterations=3)

    # Success path
    next_node = library.nodes["02_demo_rabi"]
    graph.add_node(next_node)
    graph.connect(risky_node, next_node)

    # Failure path (only after exhausting retries)
    recovery_node = library.nodes["06_demo_t1"]
    graph.add_node(recovery_node)
    graph.connect_on_failure(risky_node, recovery_node)
```

In this example, `risky_node` will retry up to 3 times. Only if it fails after all retries will targets be routed to `recovery_node`.

## Complete Example: Full Qubit Characterization

Here's a comprehensive example that combines all advanced features:

```python
from qualibrate import GraphParameters, QualibrationGraph, QualibrationLibrary

library = QualibrationLibrary.get_active_library()

class FullCharacterizationParameters(GraphParameters):
    qubits: list[str] = ["q1"]

with QualibrationGraph.build(
    "full_qubit_characterization",
    parameters=FullCharacterizationParameters(),
) as graph:
    # 1. Initial spectroscopy
    spectroscopy_node = library.nodes["01_demo_qubit_spectroscopy"]
    graph.add_node(spectroscopy_node)

    # 2. Gate optimization subgraph with retries
    with QualibrationGraph.build(
        "gate_optimization",
        parameters=FullCharacterizationParameters(),
    ) as gate_subgraph:
        rabi_node = library.nodes["02_demo_rabi"]
        gate_subgraph.add_node(rabi_node)
        gate_subgraph.loop(rabi_node, max_iterations=2)

        refined_rabi_node = library.nodes["04_demo_rabi_refined"]
        gate_subgraph.add_node(refined_rabi_node)
        gate_subgraph.connect(rabi_node, refined_rabi_node)

    graph.add_node(gate_subgraph)
    graph.connect(spectroscopy_node, gate_subgraph)

    # 3. Coherence characterization subgraph (parallel T1 and Ramsey)
    with QualibrationGraph.build(
        "coherence_characterization",
        parameters=FullCharacterizationParameters(),
    ) as coherence_subgraph:
        t1_node = library.nodes["06_demo_t1"]
        ramsey_node = library.nodes["05_demo_ramsey"]
        coherence_subgraph.add_node(t1_node)
        coherence_subgraph.add_node(ramsey_node)
        # No connection: run in parallel

    graph.add_node(coherence_subgraph)
    graph.connect(gate_subgraph, coherence_subgraph)

    # 4. Final gate fidelity assessment
    rb_node = library.nodes["07_demo_randomized_benchmarking"]
    graph.add_node(rb_node)
    graph.connect(coherence_subgraph, rb_node)

    # 5. Failure handling for gate optimization
    graph.connect_on_failure(gate_subgraph, rb_node)

if __name__ == "__main__":
    result = graph.run()
    print(f"Characterization complete: {result}")
```

This example demonstrates:
- **Context manager usage** for clean graph construction
- **Nested subgraphs** for logical organization (gate optimization, coherence characterization)
- **Looping** with retries on the Rabi node
- **Failure handling** that routes gate optimization failures directly to final assessment
- **Parallel execution** of T1 and Ramsey (no connection between them)

## Best Practices

### When to Use Nested Subgraphs

- **Logical grouping**: Related calibration steps that form a conceptual unit
- **Reusability**: Subgraphs can be shared across multiple parent graphs
- **Parallel execution**: Group nodes that should run in parallel within a subgraph
- **Clarity**: Complex workflows are easier to understand when broken into smaller pieces

### When to Use Looping

- **Transient failures**: Environmental noise may cause occasional calibration failures
- **Adaptive calibration**: Iteratively refine calibration based on measurement results
- **Convergence**: Repeat until a measurement reaches a target precision or value
- **Conditional logic**: Per-target decisions based on calibration outcomes

### When to Use Failure Handling

- **Robust workflows**: Ensure the calibration routine continues despite individual failures
- **Diagnostics**: Route failures to diagnostic nodes that investigate the cause
- **Fallback strategies**: Define alternative calibration approaches when primary methods fail
- **Recovery procedures**: Reset or reconfigure qubits after calibration failures

### Combining Features

Advanced features can be combined to create sophisticated workflows:
- **Loops + Failure handling**: Retry a node, then route persistent failures to a recovery path
- **Subgraphs + Failure handling**: Handle failures at the subgraph level for coarse-grained recovery
- **Subgraphs + Loops**: Apply retry logic to entire groups of calibrations
- **Conditional loops + Failure handling**: Implement adaptive logic with explicit failure paths

## Migration from Legacy API

If you have existing graphs created without the context manager, migrating is straightforward:

### Before (Legacy API)

```python
from qualibrate import QualibrationLibrary, QualibrationGraph, GraphParameters
from qualibrate.orchestration.basic_orchestrator import BasicOrchestrator

library = QualibrationLibrary.get_active_library()

class Parameters(GraphParameters):
    qubits: list[str] = None

graph = QualibrationGraph(
    name="workflow1",
    parameters=Parameters(),
    nodes={
        "qubit_spec": library.nodes["qubit_spec"],
        "rabi": library.nodes["rabi"],
        "ramsey": library.nodes["ramsey"],
    },
    connectivity=[("qubit_spec", "rabi"), ("rabi", "ramsey")],
    orchestrator=BasicOrchestrator(skip_failed=True),
)
```

### After (Context Manager API)

```python
from qualibrate import QualibrationLibrary, QualibrationGraph, GraphParameters

library = QualibrationLibrary.get_active_library()

class Parameters(GraphParameters):
    qubits: list[str] = None

with QualibrationGraph.build(
    "workflow1",
    parameters=Parameters(),
) as graph:
    qubit_spec = library.nodes["qubit_spec"]
    rabi = library.nodes["rabi"]
    ramsey = library.nodes["ramsey"]

    graph.add_node(qubit_spec)
    graph.add_node(rabi)
    graph.add_node(ramsey)

    graph.connect(qubit_spec, rabi)
    graph.connect(rabi, ramsey)
```

The context manager API is more explicit, easier to read, and provides better error messages when graph construction fails.
