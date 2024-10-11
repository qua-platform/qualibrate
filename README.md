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

To get started, follow these steps:

1. **Install QUAlibrate**

   ```bash
   pip install qualibrate
   ```

2. **Run Configuration Setup**
   Run the following command to create a configuration file:

   ```bash
   qualibrate config
   ```

   Hit `Y` to accept the default options, which will create a configuration file in `~/.qualibrate/config.toml`. Any settings can be modified afterwards.

## Next steps

### Documentation

Once QUAlibrate has been installed, it can be used to create and run calibration nodes and calibration graphs. This can be done either through the frontend, or through the web app. We recommend following the documentation which provides in-depth explanations on each of the QUAlibrate topics.

### Transform scripts into a calibration node

QUAlibrate can easily convert calibration scripts into a calibration node using the `QualibrationNode`, which provides a simple and efficient way to encapsulate calibration routines.

```
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

This conversion automatically handles data saving, and allows the calibration node to be called externally, for example as part of a calibration graph, or through the QUAlibrate web app.

### Run the QUAlibrate web app

You can start the QUAlibrate web interface using:

```
qualibrate start
```

The interface will be available at [http://localhost:8001](http://localhost:8001).

## Contributing

We welcome contributions from the community! If you want to report a bug, suggest a new feature, or contribute code, please refer to our [contribution guidelines](https://github.com/qua-platform/qualibrate/blob/main/CONTRIBUTING.md).

## License

QUAlibrate is licensed under the BSD-3 license. See the [LICENSE](https://github.com/qua-platform/qualibrate/blob/main/LICENSE) file for more details.

## *Contact*

For any questions or support, please open a corresponding GitHub issue.
