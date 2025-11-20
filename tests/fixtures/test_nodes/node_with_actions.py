"""
Test node with multiple actions demonstrating action chaining and skipping.

This node tests:
- Multiple actions that build on each other
- Action skipping via skip_actions parameter
- Namespace accumulation across actions
- Conditional action execution via skip_if
"""

from unittest.mock import Mock
import numpy as np
import xarray as xr
from pydantic import Field

from qualibrate import NodeParameters, QualibrationNode
from qualang_tools.units import unit
from qualang_tools.results import progress_counter
from qualibration_libs.data import XarrayDataFetcher


class Parameters(NodeParameters):
    """Parameters for action test node."""

    amplitude: float = Field(default=0.5, ge=0.0, le=1.0)
    frequency: float = Field(default=5.0e9, gt=0.0)
    num_points: int = Field(default=10, ge=1)
    num_shots: int = Field(default=1000, ge=1)
    frequency_span_in_mhz: float = Field(default=100, gt=0.0)
    frequency_step_in_mhz: float = Field(default=0.25, gt=0.0)
    update_state: bool = Field(
        default=True,
        description="Whether to run the state update action",
    )
    trigger_error: bool = Field(
        default=False,
        description="Whether to run the action that raises an error",
    )
    error_message: str = Field(
        default="Test error from action",
        description="Error message to use",
    )
    trigger_deep_error: bool = Field(
        default=False,
        description="Whether to run the action that raises an error inside XarrayDataFetcher",
    )


# Create the node
node = QualibrationNode(
    name="node_with_actions",
    parameters=Parameters(),
)


@node.run_action
def prepare_data(node):
    """Generate measurement data based on parameters."""
    data = [
        node.parameters.amplitude * i
        for i in range(node.parameters.num_points)
    ]
    return {
        "data": data,
        "data_length": len(data),
        "amplitude": node.parameters.amplitude,
    }


@node.run_action
def process_data(node):
    """Process the prepared data."""
    # Access data from previous action via namespace
    raw_data = node.namespace["data"]
    processed = [x * 2 for x in raw_data]
    mean_value = sum(processed) / len(processed)

    return {
        "processed_data": processed,
        "mean": mean_value,
        "max": max(processed),
        "min": min(processed),
    }


@node.run_action(skip_if=not node.parameters.trigger_deep_error)
def execute_qua_program(node):
    mock_job = Mock()
    mock_job.result_handles.keys.return_value = []

    # Code supposed to display the progress bar (won't work)
    u = unit(coerce_to_integer=True)
    span = node.parameters.frequency_span_in_mhz * u.MHz
    step = node.parameters.frequency_step_in_mhz * u.MHz
    dfs = np.arange(-span // 2, +span // 2, step)
    sweep_axes = {
        "qubit": xr.DataArray(["q1", "q2"]),
        "detuning": xr.DataArray(dfs, attrs={"long_name": "readout frequency", "units": "Hz"}),
    }
    data_fetcher = XarrayDataFetcher(mock_job, sweep_axes)
    for dataset in data_fetcher:
        progress_counter(
            data_fetcher["nonexistent_key"],  # This will raise KeyError from inside XarrayDataFetcher
            node.parameters.num_shots,
            start_time=data_fetcher.t_start,
        )
    node.log(mock_job.execution_report())

    return {"ds_raw": dataset}


@node.run_action(skip_if=not node.parameters.update_state)
def update_machine_state(node):
    """Update quantum machine state (if enabled)."""
    # This action only runs if update_state is True
    state_updated = False

    if node.machine:
        # Would update machine parameters here in real scenario
        # For testing, just track that we would update
        state_updated = True

    return {
        "state_updated": state_updated,
        "frequency_used": node.parameters.frequency,
    }


@node.run_action(skip_if=not node.parameters.trigger_error)
def process_data_with_error(node):
    """Process data - this action raises an error when executed."""
    # This action always fails when it runs
    raise ValueError(node.parameters.error_message)


@node.run_action
def finalize_results(node):
    """Collect all results into final summary."""
    # Gather all data from namespace
    summary = {
        "total_actions_run": 4,  # This action is always last
        "data_points": node.namespace.get("data_length", 0),
        "mean_value": node.namespace.get("mean", 0),
    }

    return {"summary": summary}


node.results = node.namespace
