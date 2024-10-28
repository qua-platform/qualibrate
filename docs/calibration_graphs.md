# Calibration Graphs

## Introduction

Tuning up a qubit or multiple qubits in a quantum processing unit (QPU) involves executing a sequence of calibration nodes. The next calibration node to be executed may depend on the measurement outcome of one or more previous nodes, allowing for adaptive decision-making based on previous results, which is crucial for efficient calibration. This process is called a calibration routine and can be represented using a directed acyclic graph (DAG) together with an orchestrator.

In QUAlibrate, a `QualibrationGraph` is used to represent these calibration routines. The nodes in the DAG are `QualibrationNode` instances, and the edges between nodes determine the execution order: a destination node can only be executed once its origin node has successfully completed.

## Graph Execution Using Targets and an Orchestrator

To execute a calibration graph, two key elements are required: the `targets` and the orchestrator. Targets specify what is being calibrated, while the orchestrator manages the execution sequence.

The `targets` specify the entities to which the graph should be applied, typically qubits. These targets allow the calibration nodes to understand which parts of the quantum system they should act upon.

The orchestrator, specifically a `QualibrationOrchestrator`, determines the sequence of node execution in the graph. It traverses the `QualibrationGraph`, deciding which `QualibrationNode` should be executed next based on the outcomes of previous nodes. The orchestrator ensures that nodes are executed in the correct order and selects which targets (e.g., qubits) should be used for each node.

Due to the dependencies between nodes, orchestrating their execution can be complex. The complexity arises from the need to account for varying outcomes and ensure that all dependencies are satisfied. As a result, there is no single optimal `QualibrationOrchestrator`. Different types of orchestrators can be used, each focusing on specific properties such as simplicity, reliability, or efficiency.

## `QualibrationNode` Requirements

To be used within a `QualibrationGraph`, a `QualibrationNode` must meet certain requirements.

### Specifying Node Targets (Qubits)

The first requirement is to specify the targets for the node. By default, these targets are `qubits`, meaning that `qubits` should be defined as one of the parameters for the node:

```python
from typing import Optional, List
from qualibrate import NodeParameters

class Parameters(NodeParameters):
    qubits: Optional[List[str]] = None
    # Include other parameters here
```

This setup indicates that the `QualibrationNode` can receive a list of qubits as targets for calibration.

/// details | Using `targets` other than `qubits`
By default, the `targets` parameter is set to `qubits`, as this is the most common use case for calibrations. However, the `targets` can be modified to accommodate different types by changing the class variable `Parameters.targets_name`. For example, if the node performs calibration on qubit pairs rather than individual qubits, it can be specified as follows:

```python
from typing import ClassVar, Optional, List

class Parameters(NodeParameters):
    targets_name: ClassVar[str] = "qubit_pairs"
    qubit_pairs: Optional[List[str]] = None
    # Include other parameters here
```

///

!!! Note "Targets Type"
    Currently, each target is expected to be of type `str`. Therefore, the `targets` parameter type should be `Optional[List[str]]` with a default value of `None`. In the future, support for additional types will be added.

#### Adding Node Outcome per Target

A `QualibrationNode` must also indicate the calibration outcome for each target. This is essential for deciding the subsequent calibration steps based on success or failure. This is important for determining subsequent steps based on which targets were calibrated successfully and which ones failed. For instance, if the node was executed with the parameter `qubits = ["q0", "q1"]`, then the outcomes can be set as follows:

```python
node.outcomes = {
    "q0": "successful",
    "q1": "failed",
}
```

The `outcomes` attribute is crucial for guiding the next steps in the calibration process. If no outcome is provided, the `QualibrationOrchestrator` assumes that the node was successful for all targets.

## Creating a QualibrationGraph

Similar to a `QualibrationNode`, a `QualibrationGraph` should be defined in a dedicated Python script and saved in the `qualibrate_runner.calibration_library_folder` path specified in the [configuration file](configuration.md).

### Example: Creating a `QualibrationGraph`

In this example, we will create a graph composed of three `QualibrationNode`s: `"qubit_spec" → "rabi" → "ramsey"`. We assume that these nodes already exist in the calibration library folder. The arrow indicates that each subsequent node can only be executed if the previous node had a successful outcome for that target.

### Importing `qualibrate`

The first step is to import the relevant classes from `qualibrate`:

```python
from typing import List, Optional
from qualibrate import QualibrationLibrary, QualibrationGraph, GraphParameters
from qualibrate.orchestration.basic_orchestrator import BasicOrchestrator
```

### Loading the Calibration Library

The next step is to load the calibration library:

```python
library = QualibrationLibrary.get_active_library()
```

This will scan the library folder and load all existing nodes and graphs, which allows us to use the nodes in the graph.

### Defining Graph Input Parameters

Next, define the graph parameters. Typically, this only consists of the graph targets, which are `qubits` by default:

```python
class Parameters(GraphParameters):
    qubits: Optional[List[str]] = None
```

### Constructing the `QualibrationGraph`

Now we are ready to create the `QualibrationGraph`:

```python
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

Here is an explanation of each property:

- `name`: Unique name for the `QualibrationGraph`, used by the `QualibrationLibrary` to index the graph.
- `parameters`: An instance of the previously defined `Parameters` class.
- `nodes`: A dictionary containing `QualibrationNode` instances, retrieved from the library. The keys are used when defining the connectivity.
- `connectivity`: Defines the edges between nodes. Each element is a tuple of the form `("source_node", "target_node")`.
- `orchestrator`: The `QualibrationOrchestrator` used to execute the graph. In this case, the `BasicOrchestrator` is used with the argument `skip_failed=True`.

### Running the QualibrationGraph

After creating the graph, it can be executed as follows:

```python
graph.run(qubits=["q1", "q2", "q3"])
```

### Full `QualibrationGraph` File

Combining all the elements from the previous sections, the final script containing the `QualibrationGraph` looks like this:

```python
from typing import List, Optional
from qualibrate import QualibrationLibrary, QualibrationGraph, GraphParameters
from qualibrate.orchestration.basic_orchestrator import BasicOrchestrator

library = QualibrationLibrary.get_active_library()

# Define graph target parameters
class Parameters(GraphParameters):
    qubits: Optional[List[str]] = None

# Create the QualibrationGraph
graph = QualibrationGraph(
    name="workflow1",  # Unique graph name
    parameters=Parameters(),  # Instantiate graph parameters
    nodes={  # Specify nodes used in the graph
        "qubit_spec": library.nodes["qubit_spec"],
        "rabi": library.nodes["rabi"],
        "ramsey": library.nodes["ramsey"],
    },
    # Specify directed relationships between graph nodes
    connectivity=[("qubit_spec", "rabi"), ("rabi", "ramsey")],
    # Specify orchestrator used to run the graph
    orchestrator=BasicOrchestrator(skip_failed=True),
)

# Run the calibration graph for qubits q1, q2, and q3
graph.run(qubits=["q1", "q2", "q3"])
```

This script can be executed from any IDE or terminal. Additionally, it can also be run from the [QUAlibrate Web App](web_app.md), provided it is saved in the `qualibrate_runner.calibration_library_folder` path specified in the [configuration file](configuration.md).

## QualibrationOrchestrator

The `QualibrationOrchestrator` is responsible for running a `QualibrationGraph`, i.e. deciding which `QualibrationNode` to execute next and what `targets` (e.g. qubits) should be calibrated in that node.
This decision process typically relies on the node outcomes of executed nodes.
The choices that a `QualibrationOrchestrator` makes include

- What should happen to a target if its calibration failed in a node? Should it be dropped from further calibrations, or should the failed calibration be remedied, for example by attempting the same or a previous calibration again?
- If multiple calibration nodes can be executed next, which one has priority?
- Should the next `QualibrationNode` run on multiple targets simultaneously, or on one at a time?

There is no single right answer to this question, and therefore different subclasses of `QualibrationOrchestrator` are created that implement different graph traversal algorithm.
Currently, QUAlibrate has the `BasicOrchestrator` that implements a straightforward graph traversal.
Additional orchestrators will be added to QUAlibrate in the future, and users can also implement custom graph traversal algorithms by subclassing the `QualibrationOrchestrator`.


### BasicOrchestrator

The `BasicOrchestrator` is a straightforward graph traversal algorithm with a single parameter `skip_failed`, which determines whether to continue calibrating failed targets.
The functionality of this algorithm is described here.

1. For each target, collect all nodes that have not yet been executed and whose predecessors have been executed.
2. Run each of these nodes, grouping targets together that are executed on the same node.
   If a node outcome `failed` for a target, then the action depends on `skip_failed`:
   a. `skip_failed = True` → Remove the target from any further calibrations
   b. `skip_failed = False` → ignore the node outcome and keep using the target for further calibration.
3. Repeat 1 and 2 until the list of nodes in Step 1 is empty.

The `BasicOrchestrator` can be instantiated as follows:

```python
from qualibrate.orchestration.basic_orchestrator import BasicOrchestrator

orchestrator = BasicOrchestrator(skip_failed=True)
```