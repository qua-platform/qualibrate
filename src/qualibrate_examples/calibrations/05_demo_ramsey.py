"""Demo: Ramsey Fringes - simulates T2* coherence measurement."""

# %% Imports
import time
from typing import Any

import matplotlib.pyplot as plt
import numpy as np
from scipy.optimize import curve_fit

from qualibrate.core import NodeParameters, QualibrationNode


# %% Parameters
class Parameters(NodeParameters):
    """Parameters for demo Ramsey measurement."""

    qubits: list[str] = ["q1", "q2"]
    num_shots: int = 100
    max_delay: float = 20e-6  # seconds (20 microseconds)
    num_points: int = 50
    duration: float = 8.0  # seconds


# %% Helper Functions
def _ramsey_decay(
    delay: np.ndarray, freq: float, t2_star: float, phase: float, offset: float
) -> np.ndarray:
    """Decaying oscillation for Ramsey fringes."""
    return 0.5 * (
        1 + np.exp(-delay / t2_star) * np.cos(2 * np.pi * freq * delay + phase)
    ) + offset


def _generate_ramsey_data(
    delays: np.ndarray, noise_level: float = 0.03
) -> np.ndarray:
    """Generate realistic Ramsey fringes with decoherence."""
    freq = np.random.uniform(1.5e6, 3.0e6)  # Detuning frequency (Hz)
    t2_star = np.random.uniform(8e-6, 12e-6)  # T2* time (seconds)
    phase = np.random.uniform(-0.3, 0.3)
    offset = np.random.uniform(-0.05, 0.05)
    signal = _ramsey_decay(delays, freq, t2_star, phase, offset)
    noise = np.random.normal(0, noise_level, size=len(delays))
    return signal + noise


def _fit_ramsey(delays: np.ndarray, populations: np.ndarray) -> dict:
    """Fit Ramsey fringes to extract T2* and detuning."""
    try:
        # FFT to estimate frequency
        fft_freqs = np.fft.fftfreq(len(populations), delays[1] - delays[0])
        fft_vals = np.abs(np.fft.fft(populations - np.mean(populations)))
        freq_guess = np.abs(fft_freqs[np.argmax(fft_vals[1:]) + 1])

        popt, _ = curve_fit(
            _ramsey_decay,
            delays,
            populations,
            p0=[freq_guess, 10e-6, 0.0, 0.0],
            bounds=([0, 1e-6, -np.pi, -0.2], [10e6, 50e-6, np.pi, 0.2]),
            maxfev=10000,
        )
        return {
            "success": True,
            "detuning": popt[0],
            "t2_star": popt[1],
            "phase": popt[2],
            "offset": popt[3],
            "fit_params": popt,
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


# %% Node Definition
description = """
DEMO: RAMSEY FRINGES (Simulated)

Simulates Ramsey interferometry to measure T2* (dephasing time) and
frequency detuning. The decaying oscillations reveal how quickly the
qubit loses phase coherence due to environmental noise.

This demo runs without hardware and serves as an educational example.
"""

node = QualibrationNode[Parameters, Any](
    name="05_demo_ramsey",
    description=description,
    parameters=Parameters(),
)


# %% Simulate experiment
@node.run_action()
def simulate_experiment(node: QualibrationNode[Parameters, Any]):
    """Simulate the Ramsey measurement."""
    p = node.parameters
    delays = np.linspace(0, p.max_delay, p.num_points)

    node.log(f"Simulating Ramsey for {p.qubits}...")
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
            "populations": _generate_ramsey_data(delays),
        }
        for q in p.qubits
    }
    node.log("Simulation complete!")


# %% Analyse data
@node.run_action()
def analyse_data(node: QualibrationNode[Parameters, Any]):
    """Fit Ramsey fringes to extract T2* and detuning."""
    fit_results = {}
    for q in node.parameters.qubits:
        raw = node.results["raw_data"][q]
        fit = _fit_ramsey(raw["delays"], raw["populations"])
        if fit["success"]:
            t2_star_us = fit["t2_star"] / 1e-6
            detuning_mhz = fit["detuning"] / 1e6
            node.log(f"{q}: T2* = {t2_star_us:.2f} μs")
            node.log(f"{q}: Detuning = {detuning_mhz:.2f} MHz")
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
    """Plot Ramsey fringes with fit."""
    qubits = node.parameters.qubits
    fig, axes = plt.subplots(1, len(qubits), figsize=(6 * len(qubits), 5))
    axes = [axes] if len(qubits) == 1 else axes

    for ax, qubit in zip(axes, qubits, strict=True):
        raw = node.results["raw_data"][qubit]
        fit_result = node.results["fit_results"][qubit]
        delays, populations = raw["delays"], raw["populations"]

        # Convert to microseconds for display
        delays_us = delays / 1e-6

        ax.scatter(delays_us, populations, alpha=0.6, s=30, label="Measured")

        if fit_result["success"]:
            delay_fine = np.linspace(delays[0], delays[-1], 200)
            delay_fine_us = delay_fine / 1e-6
            fit_curve = _ramsey_decay(delay_fine, *fit_result["fit_params"])
            ax.plot(delay_fine_us, fit_curve, "r-", linewidth=2, label="Ramsey Fit")

            # Show T2* decay envelope
            t2_star_us = fit_result["t2_star"] / 1e-6
            envelope = 0.5 * (
                1 + np.exp(-delay_fine / fit_result["t2_star"])
            ) + fit_result["offset"]
            ax.plot(
                delay_fine_us,
                envelope,
                "g--",
                alpha=0.5,
                linewidth=1.5,
                label=f"T₂* = {t2_star_us:.1f} μs",
            )

        ax.set_xlabel("Free Evolution Time (μs)", fontsize=12)
        ax.set_ylabel("Excited State Population", fontsize=12)
        ax.set_title(f"Ramsey Fringes: {qubit}", fontsize=14, fontweight="bold")
        ax.legend()
        ax.grid(True, alpha=0.3)

    plt.tight_layout()
    plt.show()
    node.results["figures"] = {"ramsey": fig}
    node.log("Plots generated successfully")


# %% Save results
@node.run_action()
def save_results(node: QualibrationNode[Parameters, Any]):
    """Save results."""
    node.save()
    node.log(f"Results saved. Outcomes: {node.outcomes}")
