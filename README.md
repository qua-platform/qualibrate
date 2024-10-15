# QUAlibrate-Core

**Core Components of QUAlibrate for Quantum Calibration**

QUAlibrate-Core is a key subrepository of the QUAlibrate project. It contains all the core components that power QUAlibrate's advanced calibration capabilities for quantum computers. These components include `QualibrationNode`, `QualibrationGraph`, `QualibrationLibrary`, and `QualibrationOrchestrator`, which are used to define, manage, and execute calibration routines for quantum processing units (QPUs).

## Core Components

- **QualibrationNode**: The fundamental building block of the QUAlibrate system, representing a specific calibration task.
- **QualibrationGraph**: A directed acyclic graph (DAG) that combines multiple calibration nodes to form adaptive calibration workflows.
- **QualibrationLibrary**: A repository for storing and organizing calibration nodes and graphs, enabling streamlined management and reuse.
- **QualibrationOrchestrator**: An orchestrator that determines the order of execution of nodes in a graph based on the outcomes of previous nodes, ensuring adaptive and efficient calibration routines.

These components provide a scalable and modular approach to quantum calibration, supporting both single-qubit and multi-qubit systems with a focus on flexibility and efficiency.

## Getting Started

To understand how to use the core components of QUAlibrate-Core, please visit the main [QUAlibrate documentation website](https://qua-platform.github.io/qualibrate/) for detailed guides and examples. For general information about QUAlibrate, including installation and usage instructions, see the [main QUAlibrate repository](https://github.com/qua-platform/qualibrate).

## Installation

To install QUAlibrate-Core, use the following command:

```bash
pip install qualibrate-core
```

QUAlibrate-Core is also automatically installed as part of QUAlibrate:

```
pip install qualibrate
```

## License

QUAlibrate-Core is licensed under the BSD-3 license. See the [LICENSE](https://github.com/qua-platform/qualibrate-core/blob/main/LICENSE) file for more details.
