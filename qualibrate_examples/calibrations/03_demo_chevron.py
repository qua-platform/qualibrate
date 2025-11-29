"""Demo: Rabi Chevron Pattern - simulates 2D frequency-duration sweep."""

# %% Imports
import time
from typing import Any

import matplotlib.pyplot as plt
import numpy as np

from qualibrate import NodeParameters, QualibrationNode


# %% Parameters
class Parameters(NodeParameters):
    """Parameters for demo Rabi Chevron pattern."""

    qubits: list[str] = ["q1", "q2"]
    num_shots: int = 100
    freq_span: float = 100e6  # Hz
    freq_points: int = 50
    duration_max: float = 0.5e-6  # seconds
    duration_points: int = 50
    rabi_rate: float = 20e6  # Hz
    simulation_duration: float = 15.0  # seconds


# %% Helper Functions
def _generate_chevron_data(
    frequencies: np.ndarray,
    durations: np.ndarray,
    rabi_rate: float,
    noise_level: float = 0.04,
) -> np.ndarray:
    """Generate realistic Rabi chevron pattern showing oscillations.

    Uses the Rabi oscillation formula for a driven two-level system:
    P(t) = (Ω/Ω_eff)² * sin²(π * Ω_eff * t)

    where:
    - Ω is the Rabi rate (drive strength) in Hz
    - δ is the detuning from resonance in Hz
    - Ω_eff = √(Ω² + δ²) is the effective Rabi frequency in Hz
    - t is the drive duration in seconds
    """
    freq_2d, duration_2d = np.meshgrid(frequencies, durations)

    # Detuning from resonance (frequencies are already relative to resonance)
    detuning = freq_2d

    # Effective Rabi frequency: Ω_eff = √(Ω² + δ²) [Hz]
    omega_eff = np.sqrt(rabi_rate**2 + detuning**2)

    # Rabi oscillation formula: P(t) = (Ω/Ω_eff)² * sin²(π * Ω_eff * t)
    # The (Ω/Ω_eff)² factor gives max oscillation amplitude at each detuning
    amplitude_factor = (rabi_rate / omega_eff) ** 2
    oscillation = np.sin(np.pi * omega_eff * duration_2d) ** 2
    population = amplitude_factor * oscillation

    # Add realistic noise
    noise = np.random.normal(0, noise_level, size=population.shape)
    return np.clip(population + noise, 0, 1)


def _find_optimal_point(
    frequencies: np.ndarray, durations: np.ndarray, chevron_data: np.ndarray
) -> dict:
    """Find the optimal drive parameters from chevron data."""
    # Find the point with maximum population (first pi pulse at resonance)
    max_idx = np.unravel_index(np.argmax(chevron_data), chevron_data.shape)
    optimal_dur_idx, optimal_freq_idx = max_idx

    return {
        "optimal_frequency": frequencies[optimal_freq_idx],
        "optimal_duration": durations[optimal_dur_idx],
        "max_population": chevron_data[optimal_dur_idx, optimal_freq_idx],
    }


# %% Node Definition
description = """
DEMO: RABI CHEVRON PATTERN (Simulated)

Simulates a 2D sweep of drive frequency and pulse duration to map out
Rabi oscillations. The chevron pattern shows how the oscillation frequency
depends on detuning, revealing the characteristic chevron shape where
Ω_eff = √(Ω² + δ²).

This demo runs without hardware and serves as an educational example.
"""

node = QualibrationNode[Parameters, Any](
    name="03_demo_chevron",
    description=description,
    parameters=Parameters(),
)


# %% Simulate experiment
@node.run_action()
def simulate_experiment(node: QualibrationNode[Parameters, Any]):
    """Simulate the Rabi chevron pattern measurement."""
    p = node.parameters
    frequencies = np.linspace(-p.freq_span / 2, p.freq_span / 2, p.freq_points)
    durations = np.linspace(0, p.duration_max, p.duration_points)
    total_points = p.freq_points * p.duration_points

    node.log(f"Simulating Rabi chevron for {p.qubits}...")
    node.log(
        f"2D sweep: {p.freq_points}×{p.duration_points} = {total_points} points..."
    )

    time_per_point = p.simulation_duration / total_points
    for i in range(total_points):
        time.sleep(time_per_point)
        if i % 50 == 0:
            node.log(f"Progress: {i}/{total_points} points")
        node.fraction_complete = (i + 1) / total_points

    node.results["raw_data"] = {
        q: {
            "frequencies": frequencies,
            "durations": durations,
            "populations": _generate_chevron_data(frequencies, durations, p.rabi_rate),
        }
        for q in p.qubits
    }
    node.log("Simulation complete!")


# %% Analyse data
@node.run_action()
def analyse_data(node: QualibrationNode[Parameters, Any]):
    """Find optimal drive parameters from Rabi chevron data."""
    analysis_results = {}
    for q in node.parameters.qubits:
        raw = node.results["raw_data"][q]
        result = _find_optimal_point(
            raw["frequencies"], raw["durations"], raw["populations"]
        )
        freq_mhz = result["optimal_frequency"] / 1e6
        dur_ns = result["optimal_duration"] / 1e-9
        node.log(f"{q}: Optimal freq = {freq_mhz:.2f} MHz")
        node.log(f"{q}: Optimal duration = {dur_ns:.1f} ns")
        analysis_results[q] = result
    node.results["analysis"] = analysis_results
    node.outcomes = {q: "successful" for q in node.parameters.qubits}


# %% Plot data
@node.run_action()
def plot_data(node: QualibrationNode[Parameters, Any]):
    """Plot Rabi chevron pattern as 2D heatmap."""
    qubits = node.parameters.qubits
    fig, axes = plt.subplots(1, len(qubits), figsize=(7 * len(qubits), 6))
    axes = [axes] if len(qubits) == 1 else axes

    for ax, qubit in zip(axes, qubits, strict=True):
        raw = node.results["raw_data"][qubit]
        analysis = node.results["analysis"][qubit]
        frequencies = raw["frequencies"]
        durations = raw["durations"]
        populations = raw["populations"]

        # Convert to display units (MHz and ns)
        freq_mhz = frequencies / 1e6
        dur_ns = durations / 1e-9

        im = ax.pcolormesh(
            freq_mhz,
            dur_ns,
            populations,
            shading="auto",
            cmap="RdYlBu_r",
            vmin=0,
            vmax=1,
        )
        cbar = plt.colorbar(im, ax=ax)
        cbar.set_label("Population", fontsize=11)

        # Mark optimal point (first pi pulse)
        opt_freq_mhz = analysis["optimal_frequency"] / 1e6
        opt_dur_ns = analysis["optimal_duration"] / 1e-9
        ax.plot(
            opt_freq_mhz,
            opt_dur_ns,
            "g*",
            markersize=20,
            label=f"Optimal: ({opt_freq_mhz:.1f} MHz, {opt_dur_ns:.1f} ns)",
        )

        ax.set_xlabel("Detuning (MHz)", fontsize=12)
        ax.set_ylabel("Drive Duration (ns)", fontsize=12)
        ax.set_title(f"Rabi Chevron Pattern: {qubit}", fontsize=14, fontweight="bold")
        ax.legend(loc="upper right")

    plt.tight_layout()
    plt.show()
    node.results["figures"] = {"chevron": fig}
    node.log("Plots generated successfully")


# %% Save results
@node.run_action()
def save_results(node: QualibrationNode[Parameters, Any]):
    """Save results."""
    node.save()
    node.log(f"Results saved. Outcomes: {node.outcomes}")
