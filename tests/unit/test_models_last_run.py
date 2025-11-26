"""
Tests for the LastRun model.

LastRun tracks complete execution information for calibration nodes and
workflows, including status, timing, results, and errors.
"""

from datetime import datetime, timedelta, timezone
from unittest.mock import Mock

import pytest
from freezegun import freeze_time

from qualibrate_runner.core.models.common import RunError, StateUpdate
from qualibrate_runner.core.models.enums import RunnableType, RunStatusEnum
from qualibrate_runner.core.models.last_run import LastRun


class TestLastRunCreation:
    """Tests for creating LastRun instances."""

    def test_create_running_node(self, aware_datetime):
        """Test creating LastRun for a running node."""
        last_run = LastRun(
            status=RunStatusEnum.RUNNING,
            started_at=aware_datetime,
            name="test_node",
            idx=-1,
            runnable_type=RunnableType.NODE,
        )

        assert last_run.status == RunStatusEnum.RUNNING
        assert last_run.started_at == aware_datetime
        assert last_run.completed_at is None
        assert last_run.name == "test_node"
        assert last_run.idx == -1
        assert last_run.runnable_type == RunnableType.NODE
        assert last_run.passed_parameters == {}
        assert last_run.run_result is None
        assert last_run.error is None

    def test_create_finished_node(self, aware_datetime, later_datetime):
        """Test creating LastRun for a finished node."""
        # Use model_construct to bypass validation for mock run_result
        last_run = LastRun.model_construct(
            status=RunStatusEnum.FINISHED,
            started_at=aware_datetime,
            completed_at=later_datetime,
            name="test_node",
            idx=42,
            runnable_type=RunnableType.NODE,
            run_result=Mock(success=True),
        )

        assert last_run.status == RunStatusEnum.FINISHED
        assert last_run.completed_at == later_datetime
        assert last_run.idx == 42
        assert last_run.run_result is not None
        assert last_run.error is None

    def test_create_error_node(
        self, aware_datetime, later_datetime, sample_run_error
    ):
        """Test creating LastRun for a failed node."""
        last_run = LastRun(
            status=RunStatusEnum.ERROR,
            started_at=aware_datetime,
            completed_at=later_datetime,
            name="test_node",
            idx=-1,
            runnable_type=RunnableType.NODE,
            error=sample_run_error,
        )

        assert last_run.status == RunStatusEnum.ERROR
        assert last_run.error is not None
        assert last_run.error.error_class == "ValueError"
        assert last_run.run_result is None

    def test_create_running_workflow(self, aware_datetime):
        """Test creating LastRun for a running workflow."""
        last_run = LastRun(
            status=RunStatusEnum.RUNNING,
            started_at=aware_datetime,
            name="test_workflow",
            idx=-1,
            runnable_type=RunnableType.GRAPH,
        )

        assert last_run.runnable_type == RunnableType.GRAPH
        assert last_run.name == "test_workflow"

    def test_create_with_passed_parameters(self, aware_datetime):
        """Test creating LastRun with passed parameters."""
        params = {
            "amplitude": 0.5,
            "frequency": 5.0e9,
            "num_averages": 1000,
        }

        last_run = LastRun(
            status=RunStatusEnum.RUNNING,
            started_at=aware_datetime,
            name="test_node",
            idx=-1,
            runnable_type=RunnableType.NODE,
            passed_parameters=params,
        )

        assert last_run.passed_parameters == params
        assert last_run.passed_parameters["amplitude"] == 0.5

    def test_create_with_state_updates(self, aware_datetime):
        """Test creating LastRun with state updates."""
        state_updates = {
            "qubit_0.frequency": StateUpdate(
                key="qubit_0",
                attr="frequency",
                old=5.0e9,
                new=5.1e9,
                updated=True,
            )
        }

        last_run = LastRun(
            status=RunStatusEnum.FINISHED,
            started_at=aware_datetime,
            completed_at=aware_datetime,
            name="test_node",
            idx=42,
            runnable_type=RunnableType.NODE,
            state_updates=state_updates,
        )

        assert len(last_run.state_updates) == 1
        assert "qubit_0.frequency" in last_run.state_updates


class TestLastRunDuration:
    """Tests for the run_duration computed field."""

    def test_duration_for_completed_run(self, aware_datetime, later_datetime):
        """Test run_duration calculation for completed run."""
        # later_datetime is 5.5 seconds after aware_datetime
        last_run = LastRun(
            status=RunStatusEnum.FINISHED,
            started_at=aware_datetime,
            completed_at=later_datetime,
            name="test_node",
            idx=42,
            runnable_type=RunnableType.NODE,
        )

        # Should be 5.5 seconds
        assert last_run.run_duration == 5.5

    def test_duration_for_running_execution(self):
        """Test run_duration for still-running execution (live duration)."""
        # Started a moment ago
        started = datetime.now(timezone.utc) - timedelta(milliseconds=100)

        last_run = LastRun(
            status=RunStatusEnum.RUNNING,
            started_at=started,
            name="test_node",
            idx=-1,
            runnable_type=RunnableType.NODE,
        )

        # Duration should be positive and small (less than 1 second)
        assert 0 < last_run.run_duration < 1.0

    def test_duration_for_very_short_run(self, aware_datetime):
        """Test duration for very short execution (milliseconds)."""
        completed = aware_datetime + timedelta(milliseconds=150)

        last_run = LastRun(
            status=RunStatusEnum.FINISHED,
            started_at=aware_datetime,
            completed_at=completed,
            name="test_node",
            idx=42,
            runnable_type=RunnableType.NODE,
        )

        assert last_run.run_duration == 0.15

    def test_duration_for_long_run(self, aware_datetime):
        """Test duration for long execution (minutes)."""
        # 5 minutes and 30 seconds
        completed = aware_datetime + timedelta(minutes=5, seconds=30)

        last_run = LastRun(
            status=RunStatusEnum.FINISHED,
            started_at=aware_datetime,
            completed_at=completed,
            name="test_node",
            idx=42,
            runnable_type=RunnableType.NODE,
        )

        assert last_run.run_duration == 330.0

    def test_duration_recalculated_on_access(self):
        """Test that duration is recalculated each time for running jobs."""
        import time

        # Start a moment ago
        started = datetime.now(timezone.utc) - timedelta(milliseconds=50)

        last_run = LastRun(
            status=RunStatusEnum.RUNNING,
            started_at=started,
            name="test_node",
            idx=-1,
            runnable_type=RunnableType.NODE,
        )

        # First access
        duration1 = last_run.run_duration
        assert duration1 > 0

        # Wait a bit
        time.sleep(0.1)

        # Second access should show increased duration
        duration2 = last_run.run_duration
        assert duration2 > duration1


class TestLastRunSerialization:
    """Tests for LastRun serialization and deserialization."""

    def test_serialize_running_node(self, sample_last_run_running):
        """Test serializing a running node to dict."""
        data = sample_last_run_running.model_dump()

        assert data["status"] == RunStatusEnum.RUNNING
        assert data["name"] == "test_node"
        assert data["idx"] == -1
        assert data["runnable_type"] == RunnableType.NODE
        assert data["completed_at"] is None
        assert data["run_result"] is None
        assert data["error"] is None

    def test_serialize_finished_node(self, sample_last_run_finished):
        """Test serializing a finished node to dict."""
        data = sample_last_run_finished.model_dump()

        assert data["status"] == RunStatusEnum.FINISHED
        assert data["completed_at"] is not None
        assert data["idx"] == 42
        assert "run_result" in data
        assert "amplitude" in data["passed_parameters"]

    def test_serialize_error_node(self, sample_last_run_error):
        """Test serializing a failed node to dict."""
        data = sample_last_run_error.model_dump()

        assert data["status"] == RunStatusEnum.ERROR
        assert data["error"] is not None
        assert data["error"]["error_class"] == "ValueError"
        assert data["error"]["message"] == "Invalid data"

    def test_deserialize_from_dict(self, aware_datetime):
        """Test deserializing LastRun from dict."""
        data = {
            "status": RunStatusEnum.RUNNING,
            "started_at": aware_datetime.isoformat(),
            "completed_at": None,
            "name": "test_node",
            "idx": -1,
            "runnable_type": RunnableType.NODE,
            "passed_parameters": {},
            "run_result": None,
            "state_updates": {},
            "error": None,
        }

        last_run = LastRun(**data)

        assert last_run.status == RunStatusEnum.RUNNING
        assert last_run.name == "test_node"


class TestLastRunStatusTransitions:
    """Tests for different status values and transitions."""

    def test_all_status_values(self, aware_datetime):
        """Test that all status enum values can be used."""
        for status in RunStatusEnum:
            last_run = LastRun(
                status=status,
                started_at=aware_datetime,
                completed_at=aware_datetime
                if status != RunStatusEnum.RUNNING
                else None,
                name="test_node",
                idx=-1,
                runnable_type=RunnableType.NODE,
            )
            assert last_run.status == status

    def test_running_to_finished_transition(self, aware_datetime):
        """Test updating from RUNNING to FINISHED status."""
        # Initial RUNNING state
        last_run = LastRun(
            status=RunStatusEnum.RUNNING,
            started_at=aware_datetime,
            name="test_node",
            idx=-1,
            runnable_type=RunnableType.NODE,
        )

        # Simulate update to FINISHED (use model_construct for mock run_result)
        completed = aware_datetime + timedelta(seconds=5)
        updated_run = LastRun.model_construct(
            status=RunStatusEnum.FINISHED,
            started_at=last_run.started_at,
            completed_at=completed,
            name=last_run.name,
            idx=42,
            runnable_type=last_run.runnable_type,
            run_result=Mock(success=True),
        )

        assert updated_run.status == RunStatusEnum.FINISHED
        assert updated_run.completed_at is not None
        assert updated_run.idx == 42

    def test_running_to_error_transition(
        self, aware_datetime, sample_run_error
    ):
        """Test updating from RUNNING to ERROR status."""
        # Initial RUNNING state
        last_run = LastRun(
            status=RunStatusEnum.RUNNING,
            started_at=aware_datetime,
            name="test_node",
            idx=-1,
            runnable_type=RunnableType.NODE,
        )

        # Simulate update to ERROR
        completed = aware_datetime + timedelta(seconds=2)
        updated_run = LastRun(
            status=RunStatusEnum.ERROR,
            started_at=last_run.started_at,
            completed_at=completed,
            name=last_run.name,
            idx=-1,
            runnable_type=last_run.runnable_type,
            error=sample_run_error,
        )

        assert updated_run.status == RunStatusEnum.ERROR
        assert updated_run.error is not None
        assert updated_run.idx == -1


class TestLastRunEdgeCases:
    """Tests for edge cases and special scenarios."""

    def test_idx_negative_one_for_no_snapshot(self, aware_datetime):
        """Test that idx=-1 indicates no snapshot was created."""
        last_run = LastRun(
            status=RunStatusEnum.RUNNING,
            started_at=aware_datetime,
            name="test_node",
            idx=-1,
            runnable_type=RunnableType.NODE,
        )

        assert last_run.idx == -1

    def test_empty_passed_parameters(self, aware_datetime):
        """Test with empty passed_parameters dict."""
        last_run = LastRun(
            status=RunStatusEnum.RUNNING,
            started_at=aware_datetime,
            name="test_node",
            idx=-1,
            runnable_type=RunnableType.NODE,
            passed_parameters={},
        )

        assert last_run.passed_parameters == {}
        assert len(last_run.passed_parameters) == 0

    def test_empty_state_updates(self, aware_datetime):
        """Test with empty state_updates dict."""
        last_run = LastRun(
            status=RunStatusEnum.FINISHED,
            started_at=aware_datetime,
            completed_at=aware_datetime,
            name="test_node",
            idx=42,
            runnable_type=RunnableType.NODE,
            state_updates={},
        )

        assert last_run.state_updates == {}
        assert len(last_run.state_updates) == 0

    def test_node_vs_graph_runnable_types(self, aware_datetime):
        """Test both NODE and GRAPH runnable types."""
        node_run = LastRun(
            status=RunStatusEnum.RUNNING,
            started_at=aware_datetime,
            name="test_node",
            idx=-1,
            runnable_type=RunnableType.NODE,
        )

        graph_run = LastRun(
            status=RunStatusEnum.RUNNING,
            started_at=aware_datetime,
            name="test_workflow",
            idx=-1,
            runnable_type=RunnableType.GRAPH,
        )

        assert node_run.runnable_type == RunnableType.NODE
        assert graph_run.runnable_type == RunnableType.GRAPH

    def test_very_long_node_name(self, aware_datetime):
        """Test with very long node name."""
        long_name = "very_long_node_name_" * 20

        last_run = LastRun(
            status=RunStatusEnum.RUNNING,
            started_at=aware_datetime,
            name=long_name,
            idx=-1,
            runnable_type=RunnableType.NODE,
        )

        assert last_run.name == long_name
        assert len(last_run.name) > 300

    def test_many_state_updates(self, aware_datetime):
        """Test with many state updates."""
        state_updates = {
            f"qubit_{i}.frequency": StateUpdate(
                key=f"qubit_{i}",
                attr="frequency",
                old=5.0e9 + i * 0.1e9,
                new=5.1e9 + i * 0.1e9,
                updated=True,
            )
            for i in range(50)
        }

        last_run = LastRun(
            status=RunStatusEnum.FINISHED,
            started_at=aware_datetime,
            completed_at=aware_datetime,
            name="test_node",
            idx=42,
            runnable_type=RunnableType.NODE,
            state_updates=state_updates,
        )

        assert len(last_run.state_updates) == 50

    def test_complex_passed_parameters(self, aware_datetime):
        """Test with complex nested passed_parameters."""
        params = {
            "basic": 42,
            "nested": {"a": 1, "b": {"c": 2}},
            "list": [1, 2, 3],
            "mixed": [{"x": 1}, {"y": 2}],
        }

        last_run = LastRun(
            status=RunStatusEnum.RUNNING,
            started_at=aware_datetime,
            name="test_node",
            idx=-1,
            runnable_type=RunnableType.NODE,
            passed_parameters=params,
        )

        assert last_run.passed_parameters["nested"]["b"]["c"] == 2
        assert len(last_run.passed_parameters["list"]) == 3
