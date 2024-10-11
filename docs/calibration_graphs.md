# Calibration Graphs

## Introduction

The tune-up of a qubit or of multiple qubits in a QPU consists of many calibration nodes being executed in sequence, where the next calibration node to execute can depend on the measurement outcome of one or more previous nodes. This process is called a calibration routine and can be represented using a directed acyclic graph (DAG).

In QUAlibrate, the `QualibrationGraph` is used to represent calibration routines. The nodes in the DAG are `QualibrationNode` instances, and the edges between nodes define the directionality, restricting the order in which nodes can be executed: a destination node can only be executed once the origin node has completed successfully.

## Graph Execution Using Targets and an Orchestrator

To execute a calibration graph, two key pieces of information are required: the `targets` and the orchestrator.

The `targets` specify the entities to which the graph should be applied, typically qubits. These `targets` allow the calibration nodes to know which parts of the quantum system they should act upon.

An orchestrator, specifically a `QualibrationOrchestrator`, determines the execution sequence of nodes in the graph. It traverses the `QualibrationGraph`, deciding which `QualibrationNode` should be executed next based on the outcomes of previous nodes. The orchestrator ensures nodes are executed in the correct order and selects which targets (e.g., qubits) should be used for each node.

Given the dependencies between nodes, orchestrating their execution is a complex task. Consequently, there is no single optimal `QualibrationOrchestrator`. Different types of orchestrators can be used, each focusing on properties such as simplicity, reliability, or efficiency.

## `QualibrationNode` in a Graph

To use a `QualibrationNode` within a `QualibrationGraph`, it must meet a few requirements.

### 1. Specify Node Targets (Qubits)

The first requirement is to specify the targets for the node. By default, these targets are `qubits`, meaning that `qubits` should be defined as one of the parameters for the node:

```python
from typing import Optional, List
from qualibrate import NodeParameters

class Parameters(NodeParameters):
    qubits: Optional[List[str]] = None
    # Include other parameters here
```

This setup indicates that the `QualibrationNode` can receive a list of qubits as targets for calibration.

!!! Note "Using `targets` that are not `qubits`"
    By default, the `targets` parameter is set to `qubits`, as this is the most common use case for calibrations. However, the `targets` can be modified to accommodate different target types by changing the class variable `Parameters.targets_name`. For example, if the node performs calibration on qubit pairs rather than individual qubits, this can be achieved using:

    ```python
    from typing import ClassVar, Optional, List

    class Parameters(NodeParameters):
        targets_name: ClassVar[str] = "qubit_pairs"
        qubit_pairs: Optional[List[str]] = None
        # Include other parameters here
    ```

!!! Note "Targets Type"
    Currently, each target is expected to be of type `str`, meaning the `targets` parameter type should be `Optional[List[str]]` with a default value of `None`. In the future, support for additional types will be added.

#### 2. Add Node Outcomes Per Target

The final requirement for a `QualibrationNode` is to indicate the calibration outcome for each target. This helps track which targets were calibrated successfully and which ones failed. If the node was executed with parameter `qubits = ["q0", "q1"]`, then an 

```python
node.outcomes = {
    "q0": "successful",
    "q1": "failed",
}
```

The `outcomes` attribute is important for determining the next steps in the calibration process based on the success or failure of each target. If it is not provided then the `QualibrationOrchestrator` assumes that the node was successful for all targets.

### Creating a QualibrationGraph

Similarly to a `QualibrationNode`, a `QualibrationGraph` should have a dedicated Python script located in the `qualibrate_runner.calibration_library_folder` path in the [configuration file](configuration.md).

In this example, we will compose a graph from three `QualibrationNode`s: `"qubit_spec" → "rabi" → "ramsey"`.
We assume that the nodes already exists in the calibration library folder.
The arrow indicates that each subsequent node can only be executed for a target if the previous node had a succesful outcome for that target.

This section describes the contents of a `QualibrationGraph` file.
We first discuss each code block separately, and then present the full graph file.

#### Importing `qualibrate`

The first step is to load the relevant classes from `qualibrate`:
```python
from typing import List, Optional
from qualibrate import QualibrationLibrary, QualibrationGraph, GraphParameters
from qualibrate.orchestration.basic_orchestrator import BasicOrchestrator
```
<!-- 1.  Additional types are also imported from the `typing` package as they will be used for defining the graph parameters -->

### Defining Graph Input Parameters

The next step is to define the graph parameters.
This typically only consists of the graph targets, which is `qubits` by default.

```python
class Parameters(GraphParameters):
    qubits: Optional[List[str]] = None
```

### Constructing the `QualibrationGraph`

```python
g = QualibrationGraph(
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
- `name`: Unique name of `QualibrationGraph`, used by the `QualibrationLibrary` to index the graph
- `parameters`: Instance of the previously defined `Parameters` class
- `nodes`: A dictionary containing `QualibrationNode` instances.
  Each node is retrieved from the library.
  The keys are used when defining the connectivity.
- `connectivity`: Edges between nodes.
  Each element is a tuple of form `("source_node", "target_node")`
- `orchestrator`: The `QualibrationOrchestrator` used to execute the graph.