"""
Tests for run_job.py orchestration layer (non-interactive mode only).
"""

from __future__ import annotations

from typing import Any
from unittest.mock import Mock, patch

import pytest
from fastapi import HTTPException
from pydantic import ValidationError

from qualibrate_runner.core.models.enums import RunnableType, RunStatusEnum
from qualibrate_runner.core.run_job import (
    get_active_library_or_error,
    run_node,
    run_workflow,
    validate_input_parameters,
)


class TestValidateInputParameters:
    """Tests for validate_input_parameters function."""

    def test_valid_parameters_pass_validation(
        self, sample_parameters_class: Any
    ) -> None:
        """Test that valid parameters pass validation."""
        params = {"amplitude": 0.5, "frequency": 5.0e9, "num_averages": 100}

        result = validate_input_parameters(sample_parameters_class, params)

        assert result.amplitude == 0.5  # type: ignore[attr-defined]
        assert result.frequency == 5.0e9  # type: ignore[attr-defined]
        assert result.num_averages == 100  # type: ignore[attr-defined]

    def test_valid_parameters_with_defaults(
        self, sample_parameters_class: Any
    ) -> None:
        """Test that validation works with default values."""
        params = {"amplitude": 0.5, "frequency": 5.0e9}

        result = validate_input_parameters(sample_parameters_class, params)

        assert result.amplitude == 0.5  # type: ignore[attr-defined]
        assert result.frequency == 5.0e9  # type: ignore[attr-defined]
        assert result.num_averages == 100  # type: ignore[attr-defined]  # Default value

    def test_invalid_parameter_raises_http_exception(
        self, sample_parameters_class: Any
    ) -> None:
        """Test that invalid parameters raise HTTPException with 422 status."""
        params = {"amplitude": 1.5, "frequency": 5.0e9}  # amplitude > 1.0

        with pytest.raises(HTTPException) as exc_info:
            validate_input_parameters(sample_parameters_class, params)

        assert exc_info.value.status_code == 422
        assert exc_info.value.detail is not None

    def test_missing_required_field_raises_http_exception(
        self, sample_parameters_class: Any
    ) -> None:
        """Test that missing required field raises HTTPException."""
        params = {"amplitude": 0.5}  # Missing required 'frequency'

        with pytest.raises(HTTPException) as exc_info:
            validate_input_parameters(sample_parameters_class, params)

        assert exc_info.value.status_code == 422
        # Check that error mentions the missing field
        errors = exc_info.value.detail
        assert any("frequency" in str(error).lower() for error in errors)

    def test_type_coercion_works(self, sample_parameters_class: Any) -> None:
        """Test that Pydantic type coercion works as expected."""
        params = {
            "amplitude": "0.5",  # String that can be coerced to float
            "frequency": 5.0e9,
            "num_averages": "50",  # String that can be coerced to int
        }

        result = validate_input_parameters(sample_parameters_class, params)

        assert result.amplitude == 0.5  # type: ignore[attr-defined]
        assert result.frequency == 5.0e9  # type: ignore[attr-defined]
        assert result.num_averages == 50  # type: ignore[attr-defined]


class TestGetActiveLibraryOrError:
    """Tests for get_active_library_or_error function."""

    @patch("qualibrate_runner.core.run_job.QualibrationLibrary")
    def test_returns_library_when_exists(
        self, mock_lib_class: Any, mock_library: Any
    ) -> None:
        """Test that function returns library when one exists."""
        mock_lib_class.get_active_library.return_value = mock_library

        result = get_active_library_or_error()

        mock_lib_class.get_active_library.assert_called_once_with(create=False)
        assert result is mock_library

    @patch("qualibrate_runner.core.run_job.QualibrationLibrary")
    def test_raises_exception_when_no_library(
        self, mock_lib_class: Any
    ) -> None:
        """Test that function raises exception when no library exists."""
        mock_lib_class.get_active_library.side_effect = RuntimeError(
            "No active library"
        )

        with pytest.raises(RuntimeError, match="No active library"):
            get_active_library_or_error()

        mock_lib_class.get_active_library.assert_called_once_with(create=False)


class TestRunNodeHappyPath:
    """Tests for run_node function - happy path scenarios."""

    def test_sets_run_item_to_node(
        self, mock_node: Any, fresh_state: Any
    ) -> None:
        """Test that state.run_item is set to the node."""
        mock_node.run = Mock(return_value=None)

        run_node(mock_node, {}, fresh_state)

        assert fresh_state.run_item is mock_node

    def test_creates_last_run_with_running_status(
        self, mock_node: Any, fresh_state: Any
    ) -> None:
        """Test that initial LastRun has RUNNING status."""
        # Track state during execution
        last_run_during_execution = None

        def capture_state(*args: Any, **kwargs: Any) -> None:
            nonlocal last_run_during_execution
            last_run_during_execution = fresh_state.last_run

        mock_node.run = Mock(side_effect=capture_state)

        run_node(mock_node, {}, fresh_state)

        # During execution, status should have been RUNNING
        assert last_run_during_execution is not None
        assert last_run_during_execution.status == RunStatusEnum.RUNNING
        assert last_run_during_execution.name == "test_node"

    def test_updates_state_with_finished_status(
        self, mock_node: Any, fresh_state: Any
    ) -> None:
        """Test that final state has FINISHED status on success."""
        mock_node.run = Mock(return_value=None)

        run_node(mock_node, {}, fresh_state)

        assert fresh_state.last_run.status == RunStatusEnum.FINISHED
        assert fresh_state.last_run.error is None

    def test_captures_snapshot_idx(
        self, mock_node: Any, fresh_state: Any
    ) -> None:
        """Test that snapshot_idx is captured from node."""
        mock_node.run = Mock(return_value=None)
        mock_node.snapshot_idx = 42

        run_node(mock_node, {}, fresh_state)

        assert fresh_state.last_run.idx == 42

    def test_captures_run_summary(
        self, mock_node: Any, fresh_state: Any
    ) -> None:
        """Test that run_summary is captured from node."""
        mock_node.run = Mock(return_value=None)
        # run_summary is None by default in fixture

        run_node(mock_node, {}, fresh_state)

        # run_result should be None since run_summary is None
        assert fresh_state.last_run.run_result is None

    def test_captures_state_updates(
        self, mock_node: Any, fresh_state: Any, sample_state_update: Any
    ) -> None:
        """Test that state_updates are captured from node."""

        mock_node.run = Mock(return_value=None)
        state_updates = {"qubit_0_frequency": sample_state_update}
        mock_node.state_updates = state_updates

        run_node(mock_node, {}, fresh_state)

        assert fresh_state.last_run.state_updates == state_updates

    def test_sets_completed_at_timestamp(
        self, mock_node: Any, fresh_state: Any
    ) -> None:
        """Test that completed_at is set after execution."""
        mock_node.run = Mock(return_value=None)

        run_node(mock_node, {}, fresh_state)

        assert fresh_state.last_run.completed_at is not None
        assert (
            fresh_state.last_run.completed_at > fresh_state.last_run.started_at
        )


class TestRunNodeErrorPath:
    """Tests for run_node function - error scenarios."""

    def test_captures_exception_in_state(
        self, mock_node: Any, fresh_state: Any
    ) -> None:
        """Test that exceptions are captured in state.last_run.error."""
        mock_node.run = Mock(side_effect=ValueError("Test error"))

        with pytest.raises(ValueError, match="Test error"):
            run_node(mock_node, {}, fresh_state)

        assert fresh_state.last_run.status == RunStatusEnum.ERROR
        assert fresh_state.last_run.error is not None
        assert fresh_state.last_run.error.error_class == "ValueError"
        assert fresh_state.last_run.error.message == "Test error"

    def test_captures_traceback(self, mock_node: Any, fresh_state: Any) -> None:
        """Test that full traceback is captured."""
        mock_node.run = Mock(side_effect=RuntimeError("Node failed"))

        with pytest.raises(RuntimeError):
            run_node(mock_node, {}, fresh_state)

        assert len(fresh_state.last_run.error.traceback) > 0
        # Traceback should be a list of strings
        assert all(
            isinstance(line, str)
            for line in fresh_state.last_run.error.traceback
        )

    def test_re_raises_original_exception(
        self, mock_node: Any, fresh_state: Any
    ) -> None:
        """Test that the original exception is re-raised."""
        original_error = ValueError("Original error")
        mock_node.run = Mock(side_effect=original_error)

        with pytest.raises(ValueError) as exc_info:
            run_node(mock_node, {}, fresh_state)

        # Should be the same exception object
        assert exc_info.value is original_error

    def test_state_updated_even_on_error(
        self, mock_node: Any, fresh_state: Any
    ) -> None:
        """Test that state is updated in finally block even on error."""
        mock_node.run = Mock(side_effect=RuntimeError("Error"))

        with pytest.raises(RuntimeError):
            run_node(mock_node, {}, fresh_state)

        # State should still be updated with error info
        assert fresh_state.last_run.status == RunStatusEnum.ERROR
        assert fresh_state.last_run.completed_at is not None
        assert fresh_state.last_run.name == "test_node"

    def test_snapshot_idx_negative_one_on_error(
        self, mock_node: Any, fresh_state: Any
    ) -> None:
        """Test that snapshot_idx remains -1 on error."""
        mock_node.run = Mock(side_effect=ValueError("Error"))
        mock_node.snapshot_idx = 42  # Should not be used on error

        with pytest.raises(ValueError):
            run_node(mock_node, {}, fresh_state)

        assert fresh_state.last_run.idx == -1


class TestRunWorkflowHappyPath:
    """Tests for run_workflow function - happy path scenarios."""

    @patch("qualibrate_runner.core.run_job.get_active_library_or_error")
    def test_retrieves_fresh_workflow_from_library(
        self,
        mock_get_library: Any,
        mock_library: Any,
        mock_workflow: Any,
        fresh_state: Any,
    ) -> None:
        """Test that workflow is retrieved fresh from library."""
        mock_get_library.return_value = mock_library

        # Create a fresh copy mock
        fresh_workflow = Mock()
        fresh_workflow.name = "test_workflow"
        fresh_workflow.snapshot_idx = 100
        fresh_workflow.run_summary = None  # Must be None or real RunSummary
        fresh_workflow.run = Mock(return_value=None)

        # Setup full_parameters_class
        mock_params = Mock()
        mock_params.nodes.model_dump.return_value = {}
        mock_params.parameters.model_dump.return_value = {"frequency": 5.0e9}
        fresh_workflow.full_parameters_class.return_value = mock_params

        mock_library.graphs["test_workflow"] = fresh_workflow

        run_workflow(
            mock_workflow, {"parameters": {"frequency": 5.0e9}}, fresh_state
        )

        # Should retrieve fresh workflow from library
        mock_get_library.assert_called_once()
        fresh_workflow.run.assert_called_once()

    @patch("qualibrate_runner.core.run_job.get_active_library_or_error")
    def test_creates_last_run_with_graph_type(
        self,
        mock_get_library: Any,
        mock_library: Any,
        mock_workflow: Any,
        fresh_state: Any,
    ) -> None:
        """Test that LastRun is created with GRAPH runnable_type."""
        mock_get_library.return_value = mock_library

        # Setup workflow
        mock_workflow.run = Mock(return_value=None)
        mock_params = Mock()
        mock_params.nodes.model_dump.return_value = {}
        mock_params.parameters.model_dump.return_value = {}
        mock_workflow.full_parameters_class.return_value = mock_params

        # Track state during execution
        last_run_during_execution = None

        def capture_state(*args: Any, **kwargs: Any) -> None:
            nonlocal last_run_during_execution
            last_run_during_execution = fresh_state.last_run

        mock_workflow.run.side_effect = capture_state

        run_workflow(mock_workflow, {}, fresh_state)

        assert last_run_during_execution is not None
        assert last_run_during_execution.runnable_type == RunnableType.GRAPH

    @patch("qualibrate_runner.core.run_job.get_active_library_or_error")
    def test_validates_parameters_with_full_parameters_class(
        self,
        mock_get_library: Any,
        mock_library: Any,
        mock_workflow: Any,
        fresh_state: Any,
    ) -> None:
        """Test that parameters are validated using full_parameters_class."""
        mock_get_library.return_value = mock_library

        # Setup workflow
        mock_workflow.run = Mock(return_value=None)
        mock_params = Mock()
        mock_params.nodes.model_dump.return_value = {}
        mock_params.parameters.model_dump.return_value = {"frequency": 5.0e9}
        mock_workflow.full_parameters_class.return_value = mock_params

        input_params = {"parameters": {"frequency": 5.0e9}, "nodes": {}}

        run_workflow(mock_workflow, input_params, fresh_state)

        # Should call full_parameters_class with input parameters
        mock_workflow.full_parameters_class.assert_called_once_with(
            **input_params
        )

    @patch("qualibrate_runner.core.run_job.get_active_library_or_error")
    def test_splits_parameters_into_nodes_and_params(
        self,
        mock_get_library: Any,
        mock_library: Any,
        mock_workflow: Any,
        fresh_state: Any,
    ) -> None:
        """Test that parameters are split into nodes and parameters."""
        mock_get_library.return_value = mock_library

        # Setup workflow
        mock_workflow.run = Mock(return_value=None)
        mock_params = Mock()
        mock_params.nodes.model_dump.return_value = {
            "node1": {"amplitude": 0.5}
        }
        mock_params.parameters.model_dump.return_value = {"frequency": 5.0e9}
        mock_workflow.full_parameters_class.return_value = mock_params

        input_params = {
            "parameters": {"frequency": 5.0e9},
            "nodes": {"node1": {"amplitude": 0.5}},
        }

        run_workflow(mock_workflow, input_params, fresh_state)

        # Should call workflow.run with separated params
        mock_workflow.run.assert_called_once_with(
            nodes={"node1": {"amplitude": 0.5}}, frequency=5.0e9
        )

    @patch("qualibrate_runner.core.run_job.get_active_library_or_error")
    def test_updates_state_with_finished_status(
        self,
        mock_get_library: Any,
        mock_library: Any,
        mock_workflow: Any,
        fresh_state: Any,
    ) -> None:
        """Test that final state has FINISHED status on success."""
        mock_get_library.return_value = mock_library

        # Setup workflow
        mock_workflow.run = Mock(return_value=None)
        mock_params = Mock()
        mock_params.nodes.model_dump.return_value = {}
        mock_params.parameters.model_dump.return_value = {}
        mock_workflow.full_parameters_class.return_value = mock_params

        run_workflow(mock_workflow, {}, fresh_state)

        assert fresh_state.last_run.status == RunStatusEnum.FINISHED
        assert fresh_state.last_run.error is None

    @patch("qualibrate_runner.core.run_job.get_active_library_or_error")
    def test_captures_workflow_snapshot_idx(
        self,
        mock_get_library: Any,
        mock_library: Any,
        mock_workflow: Any,
        fresh_state: Any,
    ) -> None:
        """Test that snapshot_idx is captured from workflow."""
        mock_get_library.return_value = mock_library

        # Setup workflow
        mock_workflow.run = Mock(return_value=None)
        mock_workflow.snapshot_idx = 100
        mock_params = Mock()
        mock_params.nodes.model_dump.return_value = {}
        mock_params.parameters.model_dump.return_value = {}
        mock_workflow.full_parameters_class.return_value = mock_params

        run_workflow(mock_workflow, {}, fresh_state)

        assert fresh_state.last_run.idx == 100


class TestRunWorkflowErrorPath:
    """Tests for run_workflow function - error scenarios."""

    @patch("qualibrate_runner.core.run_job.get_active_library_or_error")
    def test_library_not_found_raises_exception(
        self, mock_get_library: Any, mock_workflow: Any, fresh_state: Any
    ) -> None:
        """Test that missing library raises exception."""
        mock_get_library.side_effect = RuntimeError("No active library")

        with pytest.raises(RuntimeError, match="No active library"):
            run_workflow(mock_workflow, {}, fresh_state)

        assert fresh_state.last_run.status == RunStatusEnum.ERROR

    @patch("qualibrate_runner.core.run_job.get_active_library_or_error")
    def test_workflow_not_in_library_raises_exception(
        self,
        mock_get_library: Any,
        mock_library: Any,
        mock_workflow: Any,
        fresh_state: Any,
    ) -> None:
        """Test that missing workflow in library raises exception."""
        mock_get_library.return_value = mock_library
        mock_library.graphs = {}  # Empty, no workflows

        with pytest.raises(KeyError):
            run_workflow(mock_workflow, {}, fresh_state)

        assert fresh_state.last_run.status == RunStatusEnum.ERROR

    @patch("qualibrate_runner.core.run_job.get_active_library_or_error")
    def test_parameter_validation_errors_raise_exception(
        self,
        mock_get_library: Any,
        mock_library: Any,
        mock_workflow: Any,
        fresh_state: Any,
    ) -> None:
        """Test that parameter validation errors are raised."""
        mock_get_library.return_value = mock_library

        # Setup workflow to raise validation error
        mock_workflow.full_parameters_class.side_effect = (
            ValidationError.from_exception_data(
                "test",
                [
                    {
                        "type": "missing",
                        "loc": ("frequency",),
                        "input": {},
                    }
                ],
            )
        )

        with pytest.raises(ValidationError):
            run_workflow(mock_workflow, {}, fresh_state)

        assert fresh_state.last_run.status == RunStatusEnum.ERROR

    @patch("qualibrate_runner.core.run_job.get_active_library_or_error")
    def test_runtime_errors_captured_and_reraised(
        self,
        mock_get_library: Any,
        mock_library: Any,
        mock_workflow: Any,
        fresh_state: Any,
    ) -> None:
        """Test that runtime errors during workflow.run are captured."""
        mock_get_library.return_value = mock_library

        # Setup workflow to raise error during run
        mock_workflow.run = Mock(side_effect=RuntimeError("Workflow failed"))
        mock_params = Mock()
        mock_params.nodes.model_dump.return_value = {}
        mock_params.parameters.model_dump.return_value = {}
        mock_workflow.full_parameters_class.return_value = mock_params

        with pytest.raises(RuntimeError, match="Workflow failed"):
            run_workflow(mock_workflow, {}, fresh_state)

        assert fresh_state.last_run.status == RunStatusEnum.ERROR
        assert fresh_state.last_run.error.error_class == "RuntimeError"

    @patch("qualibrate_runner.core.run_job.get_active_library_or_error")
    def test_state_updated_even_on_error(
        self,
        mock_get_library: Any,
        mock_library: Any,
        mock_workflow: Any,
        fresh_state: Any,
    ) -> None:
        """Test that state is updated in finally block even on error."""
        mock_get_library.return_value = mock_library

        # Setup workflow to raise error
        mock_workflow.run = Mock(side_effect=ValueError("Error"))
        mock_params = Mock()
        mock_params.nodes.model_dump.return_value = {}
        mock_params.parameters.model_dump.return_value = {}
        mock_workflow.full_parameters_class.return_value = mock_params

        with pytest.raises(ValueError):
            run_workflow(mock_workflow, {}, fresh_state)

        # State should still be updated
        assert fresh_state.last_run.status == RunStatusEnum.ERROR
        assert fresh_state.last_run.completed_at is not None
