# Overview

Welcome to the QUAlibrate documentation! QUAlibrate is an advanced, open-source calibration platform designed to streamline the calibration process for quantum computers. Specifically built for quantum processing units (QPUs) with OPX controllers, QUAlibrate provides tools that empower users—from researchers to engineers—to efficiently tune up their quantum systems with precision and flexibility.

## What is QUAlibrate?

QUAlibrate is a comprehensive platform that enables users to create, manage, and execute calibration routines for quantum computers. It allows researchers to think in terms of their quantum system, without needing to delve into hardware-specific complexities. By offering a modular, adaptable approach to calibration, QUAlibrate scales easily from single-qubit calibrations to complex, multi-qubit workflows.

### Key Features
- **Calibration Nodes**: Reusable calibration scripts transformed into `QualibrationNode` instances that can be executed independently or as part of a larger workflow.
- **Calibration Graphs**: Directed acyclic graphs (`QualibrationGraph`) that link multiple calibration nodes to form adaptive calibration routines based on prior results.
- **Web Interface**: A user-friendly web app that enables you to execute calibration nodes and graphs with live updates and visualization, simplifying your workflow.
- **Scalable System**: Designed for scalability, QUAlibrate can handle both small- and large-scale QPU systems, allowing for seamless integration with multiple qubits and complex calibration tasks.
- **Quantum Abstract Machine (QUAM)**: A digital representation of your quantum system, ensuring reproducibility and transparency in your calibration processes.


## Getting Started

1. **Installation**: Begin by installing QUAlibrate using `pip`. Detailed instructions are available on the [Installation](installation.md) page.
2. **Configuration**: Set up the system by running the configuration command and modifying the configuration file as needed. Refer to the [Configuration](configuration.md) guide for more details.
3. **Run Calibrations**: Start running calibration nodes or graphs through either the Python interface or the web app. Learn more about each method in the [Calibration Nodes](calibration_nodes.md) and [Calibration Graphs](calibration_graphs.md) sections.
4. **Use the Web App**: Access and operate your calibration routines through an easy-to-use web interface. More information is available on the [Web App](web_app.md) page.

## Core Components

### [Calibration Nodes](calibration_nodes.md)
Calibration nodes (`QualibrationNode`) are the fundamental building blocks of the QUAlibrate system. They represent specific calibration tasks, such as adjusting the qubit frequency or optimizing gate pulses. Nodes are modular and reusable, making them highly adaptable for different types of quantum systems and calibration goals.

### [Calibration Library](calibration_library.md)
The Calibration Library is a repository of all calibration nodes and graphs, organized for ease of use and accessibility. It allows researchers to manage, update, and execute calibration routines in a streamlined way, ensuring consistency across different experiments and hardware configurations.

### [Calibration Graphs](calibration_graphs.md)
Calibration graphs (`QualibrationGraph`) combine multiple calibration nodes into a directed acyclic graph (DAG) to represent complete calibration routines. Each graph represents a workflow that adapts based on the results of previous nodes, creating an efficient and automated calibration process.

### [Web App](web_app.md)
QUAlibrate's web interface allows users to run calibration nodes and graphs intuitively. With live updates, parameter adjustments, and graphical results, the web app makes calibration processes more accessible to users without deep programming expertise.


## Community and Support
QUAlibrate is fully open source, and contributions are welcome! If you want to report a bug, request a new feature, or contribute code, check out our [GitHub repository](https://github.com/qua-platform/qualibrate). For questions, feel free to open an issue or reach out through the community.

## License
QUAlibrate is licensed under the BSD-3 license. For more details, refer to the [LICENSE](https://github.com/qua-platform/qualibrate/blob/main/LICENSE) file.
