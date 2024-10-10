# Calibration graphs

## Introduction

The tune up of a qubit or of multiple qubits in a QPU consists of many calibration nodes being executed after each other, where the next calibration node to execute can depend on the measurement outcome of one or more previous nodes.
We call this process a calibration routine, and it can be represented using a directed acyclic graph (DAG) where each node is a calibration node.
The edges between nodes have a directionality that restricts the order in which nodes can be executed: the destination node can only be executed once the origin node has completed successfully.
In QUAlibrate, the `QualibrationGraph` is used to represent these calibration routines, and correspondingly the calibration nodes are `QualibrationNode` instances.

## Parallel tune-up using targets

## Creating a `QualibrationGraph`

### `QualibrationNode` requirements

In order to use a `QualibrationNode` as a node within a `QualibrationGraph`, it needs to meet a few requirements.

#### :one: Specify targets (qubits)

The first requirement is that one of the node parameters is designated `targets`, which is typically qubits.

```python
from typing import Optional
from qualibrate import NodeParameters

class Parameters(NodeParameters):
    qubits: Optional[List[str]] = None
    # Include other parameters here
```
By default, the `targets` are set to `qubits`, as this is most typically used for calibrations. However, it can be set to anything by changing the class variable `Parameters.targets_name`. For example, if the node performs a calibration on qubit pairs instead of qubits, this can be achieved using

```python
from typing import ClassVar, Optional

class Parameters(NodeParameters):
    targets_name: ClassVar[str] = "qubit_pairs"
    qubit_pairs: Optional[List[str]] = None
    # Include other parameters here
```

!!! Note
    The type of the `targets` parameter should be set to `Optional[List[str]]` with a default value of `None`. This will be extended in the future to support other types.

## Orchestrator

Aside from the graph, and orchestrator is needed
An orchestrator is used to traverse the `QualibrationGraph`. 
The orchestrator is an algorithm that decides which `QualibrationNode` in the graph should be run next based on previous node outcomes.
. We then use an orchestrator that determines how to traverse the graph, i.e. which node to execute at each point in time, and which targets (e.g. qubits) should be used in the node.
