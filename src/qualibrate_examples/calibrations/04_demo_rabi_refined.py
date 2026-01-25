"""Demo: Refined Rabi - simulates finer amplitude sweep."""

# %% Imports
import time
from typing import Any

import matplotlib.pyplot as plt
import numpy as np
from scipy.optimize import curve_fit

from qualibrate import NodeParameters, QualibrationNode


# %% Parameters
class Parameters(NodeParameters):
    """Parameters for refined Rabi oscillations."""

    qubits: list[str] = ["q1", "q2"]
    num_shots: int = 100
    center_amplitude: float = 0.2  # Center around coarse result
    amplitude_span: float = 0.1  # Narrow span
    num_points: int = 40
    duration: float = 5.0  # seconds


# %% Helper Functions
def _rabi_oscillation(
    amplitude: np.ndarray, period: float, phase: float, offset: float, decay: float
) -> np.ndarray:
    """Damped sinusoidal for Rabi oscillations."""
    return 0.5 * (1 + np.cos(2 * np.pi * amplitude / period + phase)) * np.exp(
        -amplitude / decay
    ) + offset


def _generate_refined_rabi_data(
    amplitudes: np.ndarray, noise_level: float = 0.02
) -> np.ndarray:
    """Generate refined Rabi data with less noise."""
    period = np.random.uniform(0.18, 0.22)  # Tighter range
    phase = np.random.uniform(-0.1, 0.1)
    decay = np.random.uniform(0.9, 1.1)
    offset = np.random.uniform(-0.02, 0.02)
    signal = _rabi_oscillation(amplitudes, period, phase, offset, decay)
    noise = np.random.normal(0, noise_level, size=len(amplitudes))
    return signal + noise


def _fit_refined_rabi(amplitudes: np.ndarray, populations: np.ndarray) -> dict:
    """Fit refined Rabi data with better precision."""
    try:
        fft_freqs = np.fft.fftfreq(len(populations), amplitudes[1] - amplitudes[0])
        fft_vals = np.abs(np.fft.fft(populations - np.mean(populations)))
        period_guess = 1 / np.abs(fft_freqs[np.argmax(fft_vals[1:]) + 1])

        popt, pcov = curve_fit(
            _rabi_oscillation,
            amplitudes,
            populations,
            p0=[period_guess, 0.0, 0.0, 1.0],
            maxfev=10000,
        )
        pi_amplitude = popt[0] / 2
        pi_amplitude_std = np.sqrt(pcov[0, 0]) / 2

        return {
            "success": True,
            "pi_amplitude": pi_amplitude,
            "pi_amplitude_std": pi_amplitude_std,
            "period": popt[0],
            "phase": popt[1],
            "offset": popt[2],
            "decay": popt[3],
            "fit_params": popt,
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


# %% Node Definition
description = """
DEMO: REFINED RABI (Simulated)

Simulates a refined amplitude sweep around the coarse Rabi result.
This narrower sweep with more points provides higher precision for
determining the π pulse amplitude.

This demo runs without hardware and serves as an educational example.
"""

node = QualibrationNode[Parameters, Any](
    name="04_demo_rabi_refined",
    description=description,
    parameters=Parameters(),
)


# %% Simulate experiment
@node.run_action()
def simulate_experiment(node: QualibrationNode[Parameters, Any]):
    """Simulate the refined Rabi measurement."""
    p = node.parameters
    amplitudes = np.linspace(
        p.center_amplitude - p.amplitude_span / 2,
        p.center_amplitude + p.amplitude_span / 2,
        p.num_points,
    )

    node.log(f"Simulating refined Rabi for {p.qubits}...")
    node.log(f"Fine sweep: {p.num_points} points around {p.center_amplitude}")

    time_per_point = p.duration / p.num_points
    for i in range(p.num_points):
        time.sleep(time_per_point)
        if i % 10 == 0:
            node.log(f"Progress: {i}/{p.num_points} points")
        node.fraction_complete = (i + 1) / p.num_points

    node.results["raw_data"] = {
        q: {
            "amplitudes": amplitudes,
            "populations": _generate_refined_rabi_data(amplitudes),
        }
        for q in p.qubits
    }
    node.log("Simulation complete!")


# %% Analyse data
@node.run_action()
def analyse_data(node: QualibrationNode[Parameters, Any]):
    """Fit refined Rabi data with precision."""
    fit_results = {}
    for q in node.parameters.qubits:
        raw = node.results["raw_data"][q]
        fit = _fit_refined_rabi(raw["amplitudes"], raw["populations"])
        if fit["success"]:
            node.log(
                f"{q}: π amplitude = {fit['pi_amplitude']:.4f} "
                f"± {fit['pi_amplitude_std']:.4f}"
            )
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
    """Plot refined Rabi oscillations."""
    qubits = node.parameters.qubits
    fig, axes = plt.subplots(1, len(qubits), figsize=(6 * len(qubits), 5))
    axes = [axes] if len(qubits) == 1 else axes

    for ax, qubit in zip(axes, qubits, strict=True):
        raw = node.results["raw_data"][qubit]
        fit_result = node.results["fit_results"][qubit]
        amplitudes, populations = raw["amplitudes"], raw["populations"]

        ax.scatter(amplitudes, populations, alpha=0.6, s=40, label="Measured")

        if fit_result["success"]:
            amp_fine = np.linspace(amplitudes[0], amplitudes[-1], 200)
            fit_curve = _rabi_oscillation(amp_fine, *fit_result["fit_params"])
            ax.plot(amp_fine, fit_curve, "r-", linewidth=2, label="Rabi Fit")
            ax.axvline(
                fit_result["pi_amplitude"],
                color="green",
                linestyle="--",
                alpha=0.5,
                label=f"π = {fit_result['pi_amplitude']:.4f}±"
                f"{fit_result['pi_amplitude_std']:.4f}",
            )

        ax.set_xlabel("Drive Amplitude (a.u.)", fontsize=12)
        ax.set_ylabel("Excited State Population", fontsize=12)
        ax.set_title(f"Refined Rabi: {qubit}", fontsize=14, fontweight="bold")
        ax.legend()
        ax.grid(True, alpha=0.3)

    plt.tight_layout()
    plt.show()
    node.results["figures"] = {"refined_rabi": fig}
    node.log("Plots generated successfully")


# %% Save results
@node.run_action()
def save_results(node: QualibrationNode[Parameters, Any]):
    """Save results."""
    node.save()
    node.log(f"Results saved. Outcomes: {node.outcomes}")
