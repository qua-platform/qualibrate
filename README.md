# QUAlibrate-Runner

**Local Server for Running Quantum Calibrations**

QUAlibrate-Runner is a subpackage of QUAlibrate that acts as a local server for executing calibration tasks. It allows the QUAlibrate-App to remotely initiate calibration nodes or graphs on quantum processing units (QPUs), decoupling the web interface from the execution environment for flexibility and scalability. The server must be started from a location with access to quantum control hardware to properly execute calibration tasks.

The server must be launched in a Python environment that includes the required packages such as [QUAM](https://github.com/qua-platform/quam/) and [qm-qua](https://pypi.org/project/qm-qua/), which are essential for interacting with quantum hardware and executing calibration routines effectively.

## Installation

The recommended way to install QUAlibrate-Runner is through the main QUAlibrate package:

```bash
pip install qualibrate
```

Alternatively, QUAlibrate-Runner can be installed separately:

```bash
pip install qualibrate-runner
```

## Running the Server

Make sure you are in a Python environment that has all the necessary packages installed, including quam and qm-qua. Ensure that the server is started from a location with access to the quantum control hardware so that it can execute the requested calibration tasks effectively.&#x20;

By default, QUAlibrate-Runner is started automatically together with QUAlibrate-App when you run:

```bash
qualibrate start
```

Alternatively, you can run the QUAlibrate-Runner server separately:

```bash
qualibrate-runner start
```

In this case, ensure that the correct address and port are specified in the configuration file. For more details, refer to the [configuration documentation](https://qua-platform.github.io/qualibrate/configuration/).

## License

QUAlibrate-Runner is licensed under the BSD-3 license. See the [LICENSE](https://github.com/qua-platform/qualibrate-runner/blob/main/LICENSE) file for more details.

