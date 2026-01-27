"""Demo: T1 Measurement - simulates energy relaxation time."""

# %% Imports
import time
from typing import Any

import matplotlib.pyplot as plt
import numpy as np
from scipy.optimize import curve_fit

from qualibrate.core import NodeParameters, QualibrationNode


# %% Parameters
class Parameters(NodeParameters):
    """Parameters for demo T1 measurement."""

    qubits: list[str] = ["q1", "q2"]
    num_shots: int = 100
    max_delay: float = 50e-6  # seconds (50 microseconds)
    num_points: int = 40
    duration: float = 10.0  # seconds


# %% Helper Functions
def _exponential_decay(
    delay: np.ndarray, t1: float, amplitude: float, offset: float
) -> np.ndarray:
    """Exponential decay for T1 relaxation."""
    return amplitude * np.exp(-delay / t1) + offset


def _generate_t1_data(delays: np.ndarray, noise_level: float = 0.03) -> np.ndarray:
    """Generate realistic T1 exponential decay with noise."""
    t1 = np.random.uniform(15e-6, 25e-6)  # T1 time (seconds)
    amplitude = np.random.uniform(0.85, 0.95)  # Initial population
    offset = np.random.uniform(0.0, 0.05)  # Residual population
    signal = _exponential_decay(delays, t1, amplitude, offset)
    noise = np.random.normal(0, noise_level, size=len(delays))
    return np.clip(signal + noise, 0, 1)


def _fit_t1(delays: np.ndarray, populations: np.ndarray) -> dict:
    """Fit exponential decay to extract T1."""
    try:
        # Initial guesses
        amplitude_guess = populations[0] - populations[-1]
        offset_guess = populations[-1]
        t1_guess = delays[len(delays) // 2]

        popt, _ = curve_fit(
            _exponential_decay,
            delays,
            populations,
            p0=[t1_guess, amplitude_guess, offset_guess],
            bounds=([1e-6, 0.1, -0.1], [100e-6, 1.5, 0.5]),
            maxfev=10000,
        )
        return {
            "success": True,
            "t1": popt[0],
            "amplitude": popt[1],
            "offset": popt[2],
            "fit_params": popt,
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


# %% Node Definition
description = """
DEMO: T1 MEASUREMENT (Simulated)

Simulates measurement of the energy relaxation time (T1) by preparing
the qubit in the excited state and measuring population decay as a
function of wait time. T1 sets the ultimate limit on coherence time.

This demo runs without hardware and serves as an educational example.
"""

node = QualibrationNode[Parameters, Any](
    name="06_demo_t1",
    description=description,
    parameters=Parameters(),
)


# %% Simulate experiment
@node.run_action()
def simulate_experiment(node: QualibrationNode[Parameters, Any]):
    """Simulate the T1 measurement."""
    p = node.parameters
    delays = np.linspace(0, p.max_delay, p.num_points)

    node.log(f"Simulating T1 for {p.qubits}...")
    node.log(f"Sweeping {p.num_points} delay points up to {p.max_delay} μs...")

    time_per_point = p.duration / p.num_points
    for i in range(p.num_points):
        time.sleep(time_per_point)
        if i % 10 == 0:
            node.log(f"Progress: {i}/{p.num_points} points")
        node.fraction_complete = (i + 1) / p.num_points

    node.results["raw_data"] = {
        q: {
            "delays": delays,
            "populations": _generate_t1_data(delays),
        }
        for q in p.qubits
    }
    node.log("Simulation complete!")


# %% Analyse data
@node.run_action()
def analyse_data(node: QualibrationNode[Parameters, Any]):
    """Fit exponential decay to extract T1."""
    fit_results = {}
    for q in node.parameters.qubits:
        raw = node.results["raw_data"][q]
        fit = _fit_t1(raw["delays"], raw["populations"])
        if fit["success"]:
            t1_us = fit["t1"] / 1e-6
            node.log(f"{q}: T1 = {t1_us:.2f} μs")
            node.log(f"{q}: Initial amplitude = {fit['amplitude']:.3f}")
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
    """Plot T1 decay curve with fit."""
    qubits = node.parameters.qubits
    fig, axes = plt.subplots(1, len(qubits), figsize=(6 * len(qubits), 5))
    axes = [axes] if len(qubits) == 1 else axes

    for ax, qubit in zip(axes, qubits, strict=True):
        raw = node.results["raw_data"][qubit]
        fit_result = node.results["fit_results"][qubit]
        delays, populations = raw["delays"], raw["populations"]

        # Convert to microseconds for display
        delays_us = delays / 1e-6

        ax.scatter(delays_us, populations, alpha=0.6, s=40, label="Measured")

        if fit_result["success"]:
            delay_fine = np.linspace(delays[0], delays[-1], 200)
            delay_fine_us = delay_fine / 1e-6
            fit_curve = _exponential_decay(delay_fine, *fit_result["fit_params"])
            ax.plot(delay_fine_us, fit_curve, "r-", linewidth=2, label="Exponential Fit")

            # Mark T1 time
            t1_us = fit_result["t1"] / 1e-6
            ax.axvline(
                t1_us,
                color="green",
                linestyle="--",
                alpha=0.5,
                label=f"T₁ = {t1_us:.1f} μs",
            )

            # Show 1/e decay point
            decay_point = _exponential_decay(
                fit_result["t1"], *fit_result["fit_params"]
            )
            ax.plot(t1_us, decay_point, "go", markersize=10, alpha=0.7)

        ax.set_xlabel("Wait Time (μs)", fontsize=12)
        ax.set_ylabel("Excited State Population", fontsize=12)
        ax.set_title(f"T1 Decay: {qubit}", fontsize=14, fontweight="bold")
        ax.legend()
        ax.grid(True, alpha=0.3)

    plt.tight_layout()
    plt.show()
    node.results["figures"] = {"t1": fig}
    node.log("Plots generated successfully")


# %% Save results
@node.run_action()
def save_results(node: QualibrationNode[Parameters, Any]):
    """Save results."""
    node.save()
    node.log(f"Results saved. Outcomes: {node.outcomes}")
