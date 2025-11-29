"""Demo: Qubit Spectroscopy - simulates frequency sweep."""

# %% Imports
import time
from typing import Any

import matplotlib.pyplot as plt
import numpy as np
from scipy.optimize import curve_fit

from qualibrate import NodeParameters, QualibrationNode


# %% Parameters
class Parameters(NodeParameters):
    """Parameters for demo qubit spectroscopy."""

    qubits: list[str] = ["q1", "q2"]
    num_shots: int = 100
    span: float = 100e6  # Hz (100 MHz)
    step: float = 1e6  # Hz (1 MHz)
    duration: float = 8.0  # seconds


# %% Helper Functions
def _lorentzian(
    f: np.ndarray, f0: float, gamma: float, A: float, offset: float
) -> np.ndarray:
    """Lorentzian function for qubit resonance peak."""
    return A * (gamma**2) / ((f - f0) ** 2 + gamma**2) + offset


def _generate_spectroscopy_data(
    frequencies: np.ndarray, noise_level: float = 0.05
) -> np.ndarray:
    """Generate realistic spectroscopy with Lorentzian and noise."""
    center = frequencies[len(frequencies) // 2]
    f0 = center + np.random.uniform(-2e6, 2e6)  # ±2 MHz variation
    gamma, A, offset = 3e6, 0.8, 0.2  # gamma in Hz
    signal = _lorentzian(frequencies, f0, gamma, A, offset)
    noise = np.random.normal(0, noise_level, size=len(frequencies))
    return signal + noise


def _fit_lorentzian(frequencies: np.ndarray, amplitudes: np.ndarray) -> dict:
    """Fit Lorentzian to spectroscopy data."""
    f0_guess = frequencies[np.argmax(amplitudes)]
    gamma_guess, A_guess = 5e6, np.max(amplitudes) - np.min(amplitudes)
    offset_guess = np.min(amplitudes)

    try:
        popt, _ = curve_fit(
            _lorentzian,
            frequencies,
            amplitudes,
            p0=[f0_guess, gamma_guess, A_guess, offset_guess],
            maxfev=5000,
        )
        return {
            "success": True,
            "f0": popt[0],
            "gamma": popt[1],
            "amplitude": popt[2],
            "offset": popt[3],
            "fit_params": popt,
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


# %% Node Definition
description = """
DEMO: QUBIT SPECTROSCOPY (Simulated)

Simulates sweeping qubit drive frequency to locate the qubit resonance peak.
The data shows a Lorentzian peak with realistic noise, demonstrating how
qubit spectroscopy identifies the transition frequency.

This demo runs without hardware and serves as an educational example.
"""

node = QualibrationNode[Parameters, Any](
    name="01_demo_qubit_spectroscopy",
    description=description,
    parameters=Parameters(),
)


# %% Simulate experiment
@node.run_action()
def simulate_experiment(node: QualibrationNode[Parameters, Any]):
    """Simulate the qubit spectroscopy measurement."""
    p = node.parameters
    frequencies = np.arange(-p.span / 2, p.span / 2, p.step)
    num_points = len(frequencies)

    node.log(f"Simulating spectroscopy for {p.qubits}...")
    node.log(f"Sweeping {num_points} frequency points...")

    time_per_point = p.duration / num_points
    for i in range(num_points):
        time.sleep(time_per_point)
        if i % 10 == 0:
            node.log(f"Progress: {i}/{num_points} points")
        node.fraction_complete = (i + 1) / num_points

    node.results["raw_data"] = {
        q: {
            "frequencies": frequencies,
            "amplitudes": _generate_spectroscopy_data(frequencies),
        }
        for q in p.qubits
    }
    node.log("Simulation complete!")


# %% Analyse data
@node.run_action()
def analyse_data(node: QualibrationNode[Parameters, Any]):
    """Fit Lorentzian to the spectroscopy data."""
    fit_results = {}
    for q in node.parameters.qubits:
        raw = node.results["raw_data"][q]
        fit = _fit_lorentzian(raw["frequencies"], raw["amplitudes"])
        if fit["success"]:
            f0_mhz = fit["f0"] / 1e6
            gamma_mhz = fit["gamma"] / 1e6
            node.log(f"{q}: Found resonance at f0 = {f0_mhz:.2f} MHz")
            node.log(f"{q}: Linewidth gamma = {gamma_mhz:.2f} MHz")
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
    """Plot spectroscopy data with Lorentzian fit."""
    qubits = node.parameters.qubits
    fig, axes = plt.subplots(1, len(qubits), figsize=(6 * len(qubits), 5))
    axes = [axes] if len(qubits) == 1 else axes

    for ax, qubit in zip(axes, qubits, strict=True):
        raw = node.results["raw_data"][qubit]
        fit_result = node.results["fit_results"][qubit]
        frequencies, amplitudes = raw["frequencies"], raw["amplitudes"]

        # Convert to MHz for display
        freq_mhz = frequencies / 1e6

        ax.scatter(freq_mhz, amplitudes, alpha=0.6, s=20, label="Measured")

        if fit_result["success"]:
            f_fine = np.linspace(frequencies[0], frequencies[-1], 200)
            f_fine_mhz = f_fine / 1e6
            fit_curve = _lorentzian(f_fine, *fit_result["fit_params"])
            ax.plot(f_fine_mhz, fit_curve, "r-", linewidth=2, label="Lorentzian Fit")
            f0_mhz = fit_result["f0"] / 1e6
            ax.axvline(
                f0_mhz,
                color="green",
                linestyle="--",
                alpha=0.5,
                label=f"f₀ = {f0_mhz:.1f} MHz",
            )

        ax.set_xlabel("Detuning (MHz)", fontsize=12)
        ax.set_ylabel("Amplitude (a.u.)", fontsize=12)
        ax.set_title(f"Qubit Spectroscopy: {qubit}", fontsize=14, fontweight="bold")
        ax.legend()
        ax.grid(True, alpha=0.3)

    plt.tight_layout()
    plt.show()
    node.results["figures"] = {"spectroscopy": fig}
    node.log("Plots generated successfully")


# %% Save results
@node.run_action()
def save_results(node: QualibrationNode[Parameters, Any]):
    """Save results."""
    node.save()
    node.log(f"Results saved. Outcomes: {node.outcomes}")
