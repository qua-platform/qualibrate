"""Demo: Single Qubit Tuneup Graph - complete calibration workflow."""

# %% Imports
from typing import List
from qualibrate.orchestration.basic_orchestrator import BasicOrchestrator
from qualibrate.parameters import GraphParameters
from qualibrate.qualibration_graph import QualibrationGraph
from qualibrate.qualibration_library import QualibrationLibrary

# %% Parameter Definition
class Parameters(GraphParameters):
    qubits: List[str] = ["q1"]

# %% Graph Definition
description = """
DEMO: SINGLE QUBIT TUNEUP WORKFLOW (Simulated)

Complete calibration sequence demonstrating a realistic single-qubit tuneup:
1. Qubit Spectroscopy - Find resonance frequency
2. Rabi - Determine π pulse amplitude (coarse)
3. Chevron - Map AC Stark shift and optimize drive parameters
4. Refined Rabi - Fine-tune π pulse amplitude
5. Ramsey - Measure T2* dephasing time
6. T1 - Measure energy relaxation time
7. Randomized Benchmarking - Measure gate fidelity

All nodes run without hardware, generating realistic simulated data.
This workflow demonstrates QUAlibrate's graph execution capabilities.
"""

# Get the active library
library = QualibrationLibrary.get_active_library()

# %% Create Calibration Graph
graph = QualibrationGraph(
    name="Demo_Single_Qubit_Tuneup",
    parameters=Parameters(),
    nodes={
        "qubit_spectroscopy": library.nodes["01_demo_qubit_spectroscopy"],
        "rabi_coarse": library.nodes["02_demo_rabi"],
        "chevron": library.nodes["03_demo_chevron"],
        "rabi_refined": library.nodes["04_demo_rabi_refined"],
        "ramsey": library.nodes["05_demo_ramsey"],
        "t1": library.nodes["06_demo_t1"],
        "randomized_benchmarking": library.nodes[
            "07_demo_randomized_benchmarking"
        ],
    },
    connectivity=[
        ("qubit_spectroscopy", "rabi_coarse"),
        ("rabi_coarse", "chevron"),
        ("chevron", "rabi_refined"),
        ("rabi_refined", "ramsey"),
        ("rabi_refined", "t1"),
        ("ramsey", "randomized_benchmarking"),
        ("t1", "randomized_benchmarking"),
    ],
    orchestrator=BasicOrchestrator(skip_failed=False),
)

# %% Execute Graph
if __name__ == "__main__":
    # Execute the graph
    graph.run()
