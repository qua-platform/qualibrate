# QUAlibrate Examples

This package contains a set of demo calibrations and a demo project for the QUAlibrate platform.

## Demo Project

On the first run of `qualibrate start`, a demo project will be automatically created if no other projects exist. This demo project includes:

*   A set of demo calibrations, copied to `~/.qualibrate/demo_calibrations`.
*   A demo QUAM state, copied to `~/.qualibrate/demo_quam_state`.
*   A `demo_project` configuration that points to the copied demo calibrations and state.

This allows you to get started with QUAlibrate without having to create your own calibrations from scratch.

## Demo Calibrations

The demo calibrations are located in the `calibrations` directory. They include:

*   `01_demo_qubit_spectroscopy.py`: Simulates a qubit spectroscopy experiment.
*   `02_demo_rabi.py`: Simulates a Rabi experiment.
*   `03_demo_chevron.py`: Simulates a Chevron experiment.
*   `04_demo_rabi_refined.py`: Simulates a refined Rabi experiment.
*   `05_demo_ramsey.py`: Simulates a Ramsey experiment.
*   `06_demo_t1.py`: Simulates a T1 experiment.
*   `07_demo_randomized_benchmarking.py`: Simulates a randomized benchmarking experiment.
*   `99_demo_single_qubit_tuneup.py`: A calibration graph that combines all the demo calibrations into a single-qubit tune-up workflow.

You can run these calibrations from the QUAlibrate web app or using the Python API.

## Generating the Demo State

The demo QUAM state is generated using the script in `scripts/generate_demo_state.py`. You can run this script to regenerate the demo state:

```bash
python -m qualibrate_examples.scripts.generate_demo_state
```
