"""Generate demo QUAM state for QUAlibrate examples.

This script creates a demo quantum machine state with 3 superconducting qubits
using the QUAM library's superconducting qubit example. The generated state
can be loaded and used in QUAlibrate calibration examples.

Usage:
    python -m qualibrate_examples.scripts.generate_demo_state

The state will be saved to: qualibrate_examples/demo_quam_state/
"""
from pathlib import Path
import json

from quam.examples.superconducting_qubits.generate_superconducting_quam import (
    create_quam_superconducting_referenced,
)
from quam.examples.superconducting_qubits.components import Quam


def main():
    """Generate and save demo QUAM state."""
    # Get the package directory
    package_dir = Path(__file__).parent.parent
    state_dir = package_dir / "demo_quam_state"
    state_dir.mkdir(exist_ok=True)

    # Create QUAM with 3 qubits (q0, q1, q2)
    print("Creating demo QUAM state with 3 qubits...")
    quam = create_quam_superconducting_referenced(num_qubits=3)

    # Save the state
    print(f"Saving state to {state_dir}...")
    quam.save(state_dir, content_mapping={"wiring.json": "wiring"})

    # Also save QUA config for reference
    qua_config_file = state_dir / "qua_config.json"
    qua_config = quam.generate_config()
    with qua_config_file.open("w") as f:
        json.dump(qua_config, f, indent=4)

    print("Demo state created successfully!")
    print(f"\nState files:")
    print(f"  - {state_dir / 'state.json'}")
    print(f"  - {state_dir / 'wiring.json'}")
    print(f"  - {state_dir / 'qua_config.json'}")
    print("\nTo load the state in your calibration:")
    print("  from quam.examples.superconducting_qubits.components import Quam")
    print(f"  state = Quam.load('{state_dir}')")
    print("  qubit = state.qubits['q0']")


if __name__ == "__main__":
    main()
