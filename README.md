# QUAlibrate

**Advanced User-Programmed Calibration Software for Large-Scale Quantum Computers**

QUAlibrate is an open-source calibration platform designed specifically for quantum computers with processor-based OPX controllers. Built for scalability, ease of use, and flexibility, it empowers users to create tailored calibrations for large-scale quantum processors. With QUAlibrate, you can manage your entire calibration process—from abstract qubits down to the hardware pulse level—with high efficiency and adaptability.

## Key Features

- **Transform scripts into modular calibration nodes**: Easily convert calibration scripts into reusable nodes that can be executed independently or as part of a larger routine.
- **Combine calibration nodes into calibration graphs**: Create complex calibration workflows by combining nodes in a directed acyclic graph (DAG) structure, enabling adaptive and efficient calibration routines.
- **User-Friendly Web Interface**: Run calibrations with live updates and data visualization.
- **Scalable Quantum Calibration**: Efficiently perform parallel qubit tune-ups for large-scale QPUs.
- **Quantum Abstract Machine (QUAM)**: Digitally represent your full quantum setup for easier management and calibration.
- **Community-Driven**: Fully open source, supporting collaboration and customization.


## Installation

**Requirements**
QUAlibrate requires 3.9 ≤ Python ≤ 3.12. It is also recommended to use a [virtual environment](https://packaging.python.org/en/latest/guides/installing-using-pip-and-virtual-environments/).

1. **Install QUAlibrate**
   Run the following command in a terminal:

   ```bash
   pip install qualibrate
   ```

2. **Run Configuration Setup**
   Run the following command to create a configuration file:

   ```bash
   qualibrate config
   ```

   Hit `Y` to accept the default options, which will create a configuration file in `~/.qualibrate/config.toml`. Any settings can be modified afterwards.

## Next Steps

For detailed instructions on using QUAlibrate, including creating calibration nodes, building calibration graphs, and using the web app, please visit our comprehensive documentation website [qua-platform.github.io/qualibrate/](https://qua-platform.github.io/qualibrate/).

### Documentation

Once QUAlibrate has been installed, it can be used to create and run calibration nodes and calibration graphs. This can be done either through the frontend or through the web app. We recommend following the documentation, which provides in-depth explanations on each of the QUAlibrate topics.

### Transform Scripts into a Calibration Node

QUAlibrate can easily convert calibration scripts into a calibration node using the `QualibrationNode`, which provides a simple and efficient way to encapsulate calibration routines.

```python
from qualibrate import QualibrationNode

# Instantiate a QualibrationNode with a unique name
node = QualibrationNode(name="my_calibration_node")

# Run your regular calibration code here
...

# Record any relevant output from the calibration
node.results = {...} 

# Save the results
node.save()  # Save results
```

This conversion automatically handles data saving and allows the calibration node to be called externally, for example as part of a calibration graph or through the QUAlibrate web app.

### Run the QUAlibrate Web App

You can start the QUAlibrate web interface using:

```bash
qualibrate start
```

The interface will be available at [http://localhost:8001](http://localhost:8001).

## License

QUAlibrate is licensed under the BSD-3 license. See the [LICENSE](https://github.com/qua-platform/qualibrate/blob/main/LICENSE) file for more details.

## *Contact*

For any questions or support, please open a corresponding GitHub issue.
