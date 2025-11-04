"""Demo: Randomized Benchmarking - simulates gate fidelity measurement."""

# %% Imports
import time
from typing import Any

import matplotlib.pyplot as plt
import numpy as np
from scipy.optimize import curve_fit

from qualibrate import NodeParameters, QualibrationNode


# %% Parameters
class Parameters(NodeParameters):
    """Parameters for demo randomized benchmarking."""

    qubits: list[str] = ["q1", "q2"]
    num_shots: int = 200
    max_clifford_length: int = 100
    num_lengths: int = 15
    duration: float = 20.0  # seconds


# %% Helper Functions
def _rb_decay(length: np.ndarray, fidelity: float, offset: float) -> np.ndarray:
    """RB decay curve: exponential with gate fidelity."""
    return 0.5 * (fidelity**length) + offset


def _generate_rb_data(lengths: np.ndarray, noise_level: float = 0.02) -> np.ndarray:
    """Generate realistic RB data with decay."""
    gate_fidelity = np.random.uniform(0.985, 0.995)  # Typical single-qubit
    offset = np.random.uniform(0.48, 0.52)  # Should be ~0.5
    signal = _rb_decay(lengths, gate_fidelity, offset)
    noise = np.random.normal(0, noise_level, size=len(lengths))
    return np.clip(signal + noise, 0, 1)


def _fit_rb(lengths: np.ndarray, ground_populations: np.ndarray) -> dict:
    """Fit RB data to extract gate fidelity."""
    try:
        popt, _ = curve_fit(
            _rb_decay,
            lengths,
            ground_populations,
            p0=[0.99, 0.5],
            bounds=([0.8, 0.3], [1.0, 0.7]),
            maxfev=10000,
        )
        gate_fidelity = popt[0]
        error_per_clifford = 1 - gate_fidelity
        # Approximate conversion to gate error (2-qubit gates need factor)
        error_per_gate = error_per_clifford / 1.875  # Avg 1.875 gates/Clifford

        return {
            "success": True,
            "gate_fidelity": gate_fidelity,
            "error_per_clifford": error_per_clifford,
            "error_per_gate": error_per_gate,
            "offset": popt[1],
            "fit_params": popt,
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


# %% Node Definition
description = """
DEMO: RANDOMIZED BENCHMARKING (Simulated)

Simulates randomized benchmarking (RB) to measure average gate fidelity.
Random sequences of Clifford gates are applied at increasing lengths,
and the decay rate reveals the error per gate operation.

This demo runs without hardware and serves as an educational example.
"""

node = QualibrationNode[Parameters, Any](
    name="07_demo_randomized_benchmarking",
    description=description,
    parameters=Parameters(),
)


# %% Simulate experiment
@node.run_action()
def simulate_experiment(node: QualibrationNode[Parameters, Any]):
    """Simulate the RB measurement."""
    p = node.parameters
    lengths = np.linspace(1, p.max_clifford_length, p.num_lengths, dtype=int)

    node.log(f"Simulating RB for {p.qubits}...")
    node.log(
        f"Testing {p.num_lengths} Clifford sequence lengths "
        f"(up to {p.max_clifford_length})..."
    )

    time_per_length = p.duration / p.num_lengths
    for i in range(p.num_lengths):
        time.sleep(time_per_length)
        if i % 5 == 0:
            node.log(f"Progress: length {lengths[i]}/{p.max_clifford_length}")
        node.fraction_complete = (i + 1) / p.num_lengths

    node.results["raw_data"] = {
        q: {
            "lengths": lengths,
            "ground_populations": _generate_rb_data(lengths),
        }
        for q in p.qubits
    }
    node.log("Simulation complete!")


# %% Analyse data
@node.run_action()
def analyse_data(node: QualibrationNode[Parameters, Any]):
    """Fit RB data to extract gate fidelity."""
    fit_results = {}
    for q in node.parameters.qubits:
        raw = node.results["raw_data"][q]
        fit = _fit_rb(raw["lengths"], raw["ground_populations"])
        if fit["success"]:
            node.log(f"{q}: Gate fidelity = {fit['gate_fidelity']:.5f}")
            node.log(f"{q}: Error/gate = {fit['error_per_gate']:.5f}")
            node.log(f"{q}: Error/Clifford = {fit['error_per_clifford']:.5f}")
        else:
            node.log(f"{q}: Fit failed - {fit['error']}")
        fit_results[q] = fit
    node.results["fit_results"] = fit_results
    node.outcomes = {
        q: "successful" if fit["success"] else "failed"
        for q, fit in fit_results.items()
    }


# %% Plot data
@node.run_action()
def plot_data(node: QualibrationNode[Parameters, Any]):
    """Plot RB decay curve with fit."""
    qubits = node.parameters.qubits
    fig, axes = plt.subplots(1, len(qubits), figsize=(6 * len(qubits), 5))
    axes = [axes] if len(qubits) == 1 else axes

    for ax, qubit in zip(axes, qubits, strict=True):
        raw = node.results["raw_data"][qubit]
        fit_result = node.results["fit_results"][qubit]
        lengths, populations = raw["lengths"], raw["ground_populations"]

        ax.scatter(lengths, populations, alpha=0.6, s=50, label="Measured")

        if fit_result["success"]:
            length_fine = np.linspace(lengths[0], lengths[-1], 200)
            fit_curve = _rb_decay(length_fine, *fit_result["fit_params"])
            ax.plot(length_fine, fit_curve, "r-", linewidth=2, label="RB Fit")

            # Add text box with results
            textstr = (
                f"Gate Fidelity: {fit_result['gate_fidelity']:.5f}\n"
                f"Error/Gate: {fit_result['error_per_gate']:.5f}\n"
                f"Error/Clifford: {fit_result['error_per_clifford']:.5f}"
            )
            ax.text(
                0.6,
                0.95,
                textstr,
                transform=ax.transAxes,
                fontsize=10,
                verticalalignment="top",
                bbox=dict(boxstyle="round", facecolor="wheat", alpha=0.5),
            )

        ax.set_xlabel("Clifford Sequence Length", fontsize=12)
        ax.set_ylabel("Ground State Population", fontsize=12)
        ax.set_title(
            f"Randomized Benchmarking: {qubit}",
            fontsize=14,
            fontweight="bold",
        )
        ax.legend()
        ax.grid(True, alpha=0.3)

    plt.tight_layout()
    plt.show()
    node.results["figures"] = {"rb": fig}
    node.log("Plots generated successfully")


# %% Save results
@node.run_action()
def save_results(node: QualibrationNode[Parameters, Any]):
    """Save results."""
    node.save()
    node.log(f"Results saved. Outcomes: {node.outcomes}")
