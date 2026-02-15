# Release Notes

## Introduction

QUAlibrate is updated regularly to provide new features, performance improvements and bug fixes.
These release notes provide more information about those changes.

## Feb 15, 2026
### v1.0.2

**Important**</br>
In this release, multiple repositories have been consolidated into a single repository.</br>
Please uninstall all existing packages before installing the new one.
```
pip uninstall qualibrate
pip install qualibrate
```

**Possible breaking changes**</br>
Please ensure you import only from the exposed API (from qualibrate import *).</br>
If you rely on the folder hierarchy, include the .core hierarchy as well.
```
from qualibrate import QualibrationGraph
vs
from qualibrate.core.qualibration_graph import QualibrationGraph
```
**What's new?**

* **New history page** Quickly search past executions, filter and sort them, and add comments or tags to highlight noteworthy runs.


## January 1, 2026
### v0.6

* **Qubit selection:** Users can now easily select target qubits, with an overview of their state and fidelity.</br>
To take addvntage of the new feature, insert quam load into the Node constuctror.


* **Static typing for parameters:** Parameters are now type-validated, supporting integers, floats, lists and enumerations.
* **Graphs additions:** Enabled conditional operations, sub-graph visualization, and conditional on-failure logic.

## December 2, 2025
### v0.5

* **Nested calibration graphs:** Introduced support for composing modular calibration workflows by using existing graphs as reusable building blocks.

* **Looping constructs:** Added the ability to define loops over calibration nodes, including nested calibration graphs, with support for conditional logic.

* **Language improvements:** Simplified graph composition by enabling the use of context managers.


