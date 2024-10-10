# Calibration Library

## Overview

The Calibration Library in QUAlibrate serves as a central location for storing and organizing calibration nodes and graphs. This library allows users to easily manage, update, and execute various calibration routines, providing a streamlined process for configuring quantum systems. Calibration nodes in the library are modular components that can be included as part of a calibration graph or executed externally, for example, through the web app.&#x20;

## Loading the Calibration Library

The library of calibration nodes and graphs can be loaded in Python using the following code snippet:

```python
from qualibrate import QualibrationLibrary

library = QualibrationLibrary.get_active_library()
```

This will use the folder path specified by `qualibrate_runner.calibration_library_folder` if it is defined in the [configuration file](configuration.md). Alternatively, a custom folder can be specified using the keyword argument `library_folder`:

```python
library = QualibrationLibrary.get_active_library(library_folder="/path/to/custom/folder")
```

## Example: Loading and Running a Calibration Node

Consider a calibration script called `res_spec.py` located in the `library_folder`. The contents of this script include the following \`QualibrationNode\`:

```python
from qualibrate import NodeParameters, QualibrationNode

class Parameters(NodeParameters):
    f_center: float = 5e9
    f_span: float = 50e6

node = QualibrationNode("resonator_spectroscopy", parameters=Parameters())
```

In this example, the node `resonator_spectroscopy` can be accessed from the calibration library as follows:

```python
res_spec_node = library.nodes["resonator_spectroscopy"]
```

To execute this node, use the `run` method:

```python
res_spec_node.run(f_center=5e9, f_span=100e6)
```

Note that the keyword arguments correspond to those defined in the `Parameters` class. These arguments are optional, as the parameters have default values. This allows the default parameters to be overridden when the node is run through the library.


## Loading and running a calibration graph

Similar to calibration nodes, a [calibration graph](calibrationgraphs.md) can also be defined in the libraryfolder. A graph with name "singlequbit_tuneup" can be accessed using

```python
single_qubit_graph = library.graphs["single_qubit_tuneup"]
```

and can then be executed through

```python
single_qubit_graph.run(qubits=["q0", "q1"])
```

where qubits would be a list of qubits that the graph should calibrate.


## Integration with the QUAlibrate Web App

The Calibration Library is also integrated with the [QUAlibrate Web App](web_app.md). The web app scans the library folder for available nodes and graphs, allowing users to execute them through an intuitive graphical interface. Users can modify parameters as needed before running a node or graph, providing flexibility and ease of use.

## Best Practices

To get the most out of the Calibration Library, consider the following best practices:

- **Organize by Functionality**: Group nodes by their purpose, such as qubit tune-up, gate calibration, or diagnostics, to make it easier to locate and execute specific calibration routines.
- **Consistent Parameter Naming**: Use consistent naming conventions for parameters to facilitate easy modification and compatibility across different nodes.
- **Document Each Node**: Ensure that each calibration node is well-documented, including its purpose, parameters, and expected outcomes, to help other users understand and use the node effectively.
