# Release Notes

## Introduction

QUAlibrate is updated regularly to provide new features, performance improvements and bug fixes.
These release notes provide more information about those changes.

## March 5, 2026
### v1.1.2

* **Redesign Node library page** 
    * Node parameters can now be reviewed and edited in a modal before execution, reducing accidental runs with wrong settings.
    * Quickly search and sort the library nodes
    * Reviewing and managing pending QUAM state changes is now easier
    * Collapsible right panel allows freeing up space when focusing on configuration.


* **QUAM Export** 
 * The QUAM state can now be exported to an external database, enabling persistent storage and cross-session access to machine state.


* **Project Management** 
     * Project Switcher: A new project menu in the sidebar lets you switch between projects at any time without leaving the current view.
     * Create & Edit Projects: Projects can now be created and edited through a dedicated dialog, with configurable paths for data, QUAM state, and calibration library.
     * External database can be optionally configured for QUAM state export.

* **General** 
    * Application version label is now displayed in the UI.
    * Various bug fixes




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


