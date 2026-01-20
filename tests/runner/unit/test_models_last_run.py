"""
Tests for the LastRun model.

LastRun tracks complete execution information for calibration nodes and
workflows, including status, timing, results, and errors.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from qualibrate.runner.core.models.enums import RunnableType, RunStatusEnum
from qualibrate.runner.core.models.last_run import LastRun


class TestLastRunDuration:
    """Tests for the run_duration computed field."""

    def test_duration_for_completed_run(
        self, aware_datetime: datetime, later_datetime: datetime
    ) -> None:
        """Test run_duration calculation for completed run."""
        # later_datetime is 5.5 seconds after aware_datetime
        last_run = LastRun(
            status=RunStatusEnum.FINISHED,
            started_at=aware_datetime,
            completed_at=later_datetime,
            name="test_node",
            idx=42,
            runnable_type=RunnableType.NODE,
            passed_parameters={},
        )

        # Should be 5.5 seconds
        assert last_run.run_duration == 5.5  # type: ignore[comparison-overlap]

    def test_duration_for_running_execution(self) -> None:
        """Test run_duration for still-running execution (live duration)."""
        # Started a moment ago
        started = datetime.now(timezone.utc) - timedelta(milliseconds=100)

        last_run = LastRun(
            status=RunStatusEnum.RUNNING,
            started_at=started,
            name="test_node",
            idx=-1,
            runnable_type=RunnableType.NODE,
            passed_parameters={},
        )

        # Duration should be positive and small (less than 1 second)
        assert 0 < last_run.run_duration < 1.0  # type: ignore[operator]

    def test_duration_for_very_short_run(
        self, aware_datetime: datetime
    ) -> None:
        """Test duration for very short execution (milliseconds)."""
        completed = aware_datetime + timedelta(milliseconds=150)

        last_run = LastRun(
            status=RunStatusEnum.FINISHED,
            started_at=aware_datetime,
            completed_at=completed,
            name="test_node",
            idx=42,
            runnable_type=RunnableType.NODE,
            passed_parameters={},
        )

        assert last_run.run_duration == 0.15  # type: ignore[comparison-overlap]

    def test_duration_for_long_run(self, aware_datetime: datetime) -> None:
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
            passed_parameters={},
        )

        assert last_run.run_duration == 330.0  # type: ignore[comparison-overlap]

    def test_duration_recalculated_on_access(self) -> None:
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
            passed_parameters={},
        )

        # First access
        duration1 = last_run.run_duration
        assert duration1 > 0  # type: ignore[operator]

        # Wait a bit
        time.sleep(0.1)

        # Second access should show increased duration
        duration2 = last_run.run_duration
        assert duration2 > duration1  # type: ignore[operator]


class TestLastRunSerialization:
    """Tests for LastRun serialization and deserialization."""

    def test_serialize_running_node(
        self, sample_last_run_running: LastRun
    ) -> None:
        """Test serializing a running node to dict."""
        data = sample_last_run_running.model_dump()

        assert data["status"] == RunStatusEnum.RUNNING
        assert data["name"] == "test_node"
        assert data["idx"] == -1
        assert data["runnable_type"] == RunnableType.NODE
        assert data["completed_at"] is None
        assert data["run_result"] is None
        assert data["error"] is None

    def test_serialize_finished_node(
        self, sample_last_run_finished: LastRun
    ) -> None:
        """Test serializing a finished node to dict."""
        data = sample_last_run_finished.model_dump()

        assert data["status"] == RunStatusEnum.FINISHED
        assert data["completed_at"] is not None
        assert data["idx"] == 42
        assert "run_result" in data
        assert "amplitude" in data["passed_parameters"]

    def test_serialize_error_node(self, sample_last_run_error: LastRun) -> None:
        """Test serializing a failed node to dict."""
        data = sample_last_run_error.model_dump()

        assert data["status"] == RunStatusEnum.ERROR
        assert data["error"] is not None
        assert data["error"]["error_class"] == "ValueError"
        assert data["error"]["message"] == "Invalid data"

    def test_deserialize_from_dict(self, aware_datetime: datetime) -> None:
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


class TestLastRunEdgeCases:
    """Tests for edge cases and special scenarios."""

    def test_node_vs_graph_runnable_types(
        self, aware_datetime: datetime
    ) -> None:
        """Test both NODE and GRAPH runnable types."""
        node_run = LastRun(
            status=RunStatusEnum.RUNNING,
            started_at=aware_datetime,
            name="test_node",
            idx=-1,
            runnable_type=RunnableType.NODE,
            passed_parameters={},
        )

        graph_run = LastRun(
            status=RunStatusEnum.RUNNING,
            started_at=aware_datetime,
            name="test_workflow",
            idx=-1,
            runnable_type=RunnableType.GRAPH,
            passed_parameters={},
        )

        assert node_run.runnable_type == RunnableType.NODE
        assert graph_run.runnable_type == RunnableType.GRAPH
