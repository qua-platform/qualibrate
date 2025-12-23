"""
Tests for the State model.

State tracks the current and last executed calibration job, serving as
the single source of truth for the runner's execution state.
"""

from __future__ import annotations

from datetime import datetime
from unittest.mock import Mock

import pytest

from qualibrate_runner.config.models import State
from qualibrate_runner.core.models.common import RunError
from qualibrate_runner.core.models.enums import RunnableType, RunStatusEnum
from qualibrate_runner.core.models.last_run import LastRun


class TestStateCreation:
    """Tests for creating State instances."""

    def test_create_fresh_state(self) -> None:
        """Test creating a fresh State with no execution history."""
        state = State()

        assert state.last_run is None
        assert state.run_item is None

    def test_create_with_last_run(
        self, sample_last_run_running: LastRun
    ) -> None:
        """Test creating State with a LastRun."""
        state = State(last_run=sample_last_run_running)
        assert state.last_run is not None
        assert state.last_run.status == RunStatusEnum.RUNNING
        assert state.is_running is True


class TestIsRunningProperty:
    """Tests for the is_running property."""

    def test_not_running_when_finished(
        self, sample_last_run_finished: LastRun
    ) -> None:
        """Test is_running is False when status is FINISHED."""
        state = State(last_run=sample_last_run_finished)
        assert state.is_running is False

    def test_not_running_when_error(
        self, sample_last_run_error: LastRun
    ) -> None:
        """Test is_running is False when status is ERROR."""
        state = State(last_run=sample_last_run_error)
        assert state.is_running is False

    def test_is_running_changes_with_status(
        self, aware_datetime: datetime, mock_node: Mock
    ) -> None:
        """Test is_running property changes as status changes."""
        state = State()

        # Initially not running
        assert state.is_running is False

        # Start execution
        state.last_run = LastRun(
            status=RunStatusEnum.RUNNING,
            started_at=aware_datetime,
            name="test_node",
            idx=-1,
            runnable_type=RunnableType.NODE,
            passed_parameters={},
        )
        state.run_item = mock_node

        assert state.is_running is True

        # Complete execution
        state.last_run = LastRun(
            status=RunStatusEnum.FINISHED,
            started_at=aware_datetime,
            completed_at=aware_datetime,
            name="test_node",
            idx=42,
            runnable_type=RunnableType.NODE,
            passed_parameters={},
        )

        assert state.is_running is False


class TestClearMethod:
    """Tests for the clear() method."""

    def test_clear_finished_state(
        self, sample_last_run_finished: LastRun, mock_node: Mock
    ) -> None:
        """Test clearing state after finished execution."""
        state = State.model_construct(
            last_run=sample_last_run_finished,
            run_item=mock_node,
            passed_parameters={},
        )

        # Should succeed (not running)
        state.clear()

        assert state.last_run is None
        assert state.run_item is None

    def test_clear_error_state(
        self, sample_last_run_error: LastRun, mock_node: Mock
    ) -> None:
        """Test clearing state after error."""
        state = State.model_construct(
            last_run=sample_last_run_error,
            run_item=mock_node,
            passed_parameters={},
        )

        # Should succeed (not running)
        state.clear()

        assert state.last_run is None
        assert state.run_item is None

    def test_clear_while_running_raises_error(
        self, sample_last_run_running: LastRun, mock_node: Mock
    ) -> None:
        """Test that clearing while running raises RuntimeError."""
        state = State.model_construct(
            last_run=sample_last_run_running,
            run_item=mock_node,
            passed_parameters={},
        )

        # Should raise RuntimeError
        with pytest.raises(
            RuntimeError, match="Can't clear while item is running"
        ):
            state.clear()

        # State should be unchanged
        assert state.last_run is not None
        assert state.run_item is not None


class TestStateLifecycle:
    """Tests for the typical State lifecycle during execution."""

    def test_full_execution_lifecycle_success(
        self, aware_datetime: datetime, mock_node: Mock
    ) -> None:
        """Test state through full successful execution lifecycle."""
        state = State()

        # 1. Fresh state
        assert state.last_run is None
        assert state.run_item is None
        assert state.is_running is False

        # 2. Start execution
        state.last_run = LastRun(
            status=RunStatusEnum.RUNNING,
            started_at=aware_datetime,
            name="test_node",
            idx=-1,
            runnable_type=RunnableType.NODE,
            passed_parameters={},
        )
        state.run_item = mock_node

        assert state.is_running is True

        # 3. Complete execution
        state.last_run = LastRun(
            status=RunStatusEnum.FINISHED,
            started_at=aware_datetime,
            completed_at=aware_datetime,
            name="test_node",
            idx=42,
            runnable_type=RunnableType.NODE,
            passed_parameters={},
        )

        assert state.is_running is False
        assert state.last_run.status == RunStatusEnum.FINISHED

        # 4. Clear state
        state.clear()

        assert state.last_run is None
        assert state.run_item is None

    def test_full_execution_lifecycle_error(
        self,
        aware_datetime: datetime,
        mock_node: Mock,
        sample_run_error: RunError,
    ) -> None:
        """Test state through full error execution lifecycle."""
        state = State()

        # 1. Start execution
        state.last_run = LastRun(
            status=RunStatusEnum.RUNNING,
            started_at=aware_datetime,
            name="test_node",
            idx=-1,
            runnable_type=RunnableType.NODE,
            passed_parameters={},
        )
        state.run_item = mock_node

        assert state.is_running is True

        # 2. Error occurs
        state.last_run = LastRun(
            status=RunStatusEnum.ERROR,
            started_at=aware_datetime,
            completed_at=aware_datetime,
            name="test_node",
            idx=-1,
            runnable_type=RunnableType.NODE,
            error=sample_run_error,
            passed_parameters={},
        )

        assert state.is_running is False
        assert state.last_run.status == RunStatusEnum.ERROR

        # 3. Clear state after error
        state.clear()

        assert state.last_run is None
        assert state.run_item is None

    def test_multiple_sequential_executions(
        self, aware_datetime: datetime, mock_node: Mock
    ) -> None:
        """Test state through multiple sequential executions."""
        state = State()

        # First execution
        state.last_run = LastRun(
            status=RunStatusEnum.RUNNING,
            started_at=aware_datetime,
            name="node_1",
            idx=-1,
            runnable_type=RunnableType.NODE,
            passed_parameters={},
        )
        state.run_item = mock_node
        assert state.is_running is True

        state.last_run = LastRun(
            status=RunStatusEnum.FINISHED,
            started_at=aware_datetime,
            completed_at=aware_datetime,
            name="node_1",
            idx=1,
            runnable_type=RunnableType.NODE,
            passed_parameters={},
        )
        assert state.is_running is False

        # Second execution (without clearing)
        state.last_run = LastRun(
            status=RunStatusEnum.RUNNING,
            started_at=aware_datetime,
            name="node_2",
            idx=-1,
            runnable_type=RunnableType.NODE,
            passed_parameters={},
        )
        assert state.is_running is True
        assert state.last_run.name == "node_2"


class TestStateArbitraryTypes:
    """Tests for arbitrary type support (run_item)."""

    def test_store_node_object(self, state_with_node: State) -> None:
        """Test storing a QualibrationNode object in run_item."""
        assert state_with_node.run_item is not None
        assert state_with_node.run_item.name == "test_node"
        assert state_with_node.run_item.snapshot_idx == 42  # type: ignore[union-attr]

    def test_store_workflow_object(self, state_with_workflow: State) -> None:
        """Test storing a workflow (QGraph) object in run_item."""
        assert state_with_workflow.run_item is not None
        assert state_with_workflow.run_item.name == "test_workflow"
        assert state_with_workflow.run_item.snapshot_idx == 100  # type: ignore[union-attr]

    def test_run_item_can_be_any_object(self) -> None:
        """Test that run_item can store any object (arbitrary_types_allowed).

        Note: When using model_construct, Pydantic bypasses validation
        which allows storing any object type.
        """

        # Create a simple custom object
        class CustomRunnable:
            def __init__(self) -> None:
                self.name = "custom"

        custom_obj = CustomRunnable()
        state = State.model_construct(run_item=custom_obj)  # type: ignore[arg-type]

        assert state.run_item is not None
        assert state.run_item.name == "custom"


class TestStateEdgeCases:
    """Tests for edge cases and special scenarios."""

    def test_replace_last_run_while_not_running(
        self, sample_last_run_finished: LastRun, sample_last_run_error: LastRun
    ) -> None:
        """Test replacing last_run when not running."""
        state = State(last_run=sample_last_run_finished)

        # Replace with different LastRun
        state.last_run = sample_last_run_error

        assert state.last_run.status == RunStatusEnum.ERROR

    def test_is_running_check_is_safe_with_none(self) -> None:
        """Test that is_running safely handles None last_run."""
        state = State()

        # Should not raise AttributeError
        is_running = state.is_running

        assert is_running is False
