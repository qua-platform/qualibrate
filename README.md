# Qualibrate

## Installation

### 1. Install package

**1a Install from wheel or .tar.gz file**

> pip install <path_to_file>/qualibrate-0.1.0-py3-none-any.whl

**1b Install from folder**

1. Navigate to top-level folder `qualibrate`
2. Run `pip install .`

### 2. Create config

Run the following command

> qualibrate config

Press Y to confirm the creation of the configuration file.

This will generate a default configuration file
in `~/.qualibrate/config.toml`.  
`--help` option can be added for getting list of possible args.

### 3. Modify necessary settings

The default configuration needs to be adjusted to the specific environment.
Open the configuration file in `~/.qualibrate/config.toml` and adjust the
following settings:

- `qualibrate_runner.calibration_library_folder` - Path to the folder where
  calibration files are stored
- `qualibrate_app.qualibrate.storage.location` - Path to the folder where all
  calibration data is stored
- `qualibrate_app.qualibrate.project` - Name of the project. This should be
  a top-level folder of `user_storage`.

### 3. Run the QUAlibrate server

> qualibrate start

After running the command, the server will start and the user can access the
application at `http://localhost:8001/`



# QUAlibrate

**Advanced User-Programmed Calibration Software for Large-Scale Quantum Computers**

QUAlibrate is an open-source calibration platform designed specifically for quantum computers with processor-based OPX controllers. Built for scalability, ease of use, and flexibility, it empowers users to create tailored calibrations for large-scale quantum processors. With QUAlibrate, you can manage your entire calibration process—from abstract qubits down to the hardware pulse level—with high efficiency and adaptability.

## Features

### Three-Pillar Architecture
- **Optimized for Large-Scale Quantum Processing Units (QPUs)**: Efficiently perform parallel qubit tune-ups using automated and interactive calibration sequences.
- **Quantum Abstract Machine (QUAM)**: Represent your entire quantum setup digitally, from abstract qubits to specific hardware details.
- **Web Interface**: Run calibrations easily with a user-friendly interface, complete with live updates and detailed data visualization.

### Highlights
- **User-Friendly Web Interface**: Intuitive interface for running and managing calibrations in real-time.
- **Community-Driven and Open Source**: Fully open source under a BSD-3 license, promoting community-driven development and collaboration.
- **Customizable Calibration Framework**: Create and program your own calibration nodes and combine them into scalable calibration graphs.
- **Seamless Scalability**: Straightforward adaptation for expanding QPU setups, enabling both interactive and automated execution of calibration sequences.
- **Integrated QUAM Database**: Logs your quantum system over time, allowing easy retrieval of information and statistical analysis.
- **Gate-to-Pulse Translation**: Bridge the gap between abstract quantum circuits (e.g., OpenQASM, Qiskit, Braket, Cirq) and pulse-level execution.

### Benefits
- **Full Control**: Tailor calibration graphs to meet your specific requirements, supporting fast re-tuning or full system bring-up.
- **Efficiency and Parallelization**: Leverage scalable calibration nodes that support parallel execution across qubits, significantly reducing the time required for full calibration.
- **Community Collaboration**: Developed in collaboration with leading labs and quantum computing developers, QUAlibrate benefits from a collective knowledge base.
- **Interactive Control**: View live calibration data, adjust parameters on-the-fly, and access historical calibration records for efficient optimization.

## Getting Started

To get started, follow these steps:

1. **Clone the Repository**
   ```bash
   git clone https://github.com/qua-platform/qualibrate.git
   cd qualibrate
   ```
2. **Install Dependencies**
   Install the required dependencies using Poetry:
   ```bash
   poetry install
   ```
3. **Run the Web Interface**
   You can start the QUAlibrate web interface using:
   ```bash
   poetry run qualibrate
   ```
   The interface will be available at [http://localhost:8080](http://localhost:8080).

## Usage Overview

- **Calibration Graphs**: Use the library of existing calibration nodes or create your own to build complex calibration graphs.
- **Live Monitoring**: Monitor calibrations in real-time with live plots, and make adjustments interactively.
- **QUAM Integration**: Digitally represent your system to easily re-run calibrations, manage logs, and analyze results.

## Documentation

Comprehensive documentation is available at [our GitHub wiki](https://github.com/qua-platform/qualibrate/wiki). The documentation includes a quick start guide, in-depth explanations of calibration nodes and graphs, and advanced use cases for quantum professionals.

## Contributing

We welcome contributions from the community! If you want to report a bug, suggest a new feature, or contribute code, please refer to our [contribution guidelines](https://github.com/qua-platform/qualibrate/blob/main/CONTRIBUTING.md).

## License

QUAlibrate is licensed under the BSD-3 license. See the [LICENSE](https://github.com/qua-platform/qualibrate/blob/main/LICENSE) file for more details.

## Contact

For questions or support, please email us at [info@quantum-machines.co](mailto:info@quantum-machines.co) or visit our [website](https://www.quantum-machines.co) for more information.

## Acknowledgments

This project is built with the contributions of researchers and engineers from Quantum Machines, along with the support of our user community. We are grateful for the collaboration and insights that have helped shape QUAlibrate into a leading tool for quantum calibration.

