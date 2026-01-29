"""
Tests for common models: RunError and StateUpdate.

These models are used to capture error information and state changes
during calibration execution.
"""

from __future__ import annotations

from qualibrate.runner.core.models.common import RunError, StateUpdate


class TestRunError:
    """Tests for the RunError model."""

    def test_serialization(self, sample_run_error: RunError) -> None:
        """Test that RunError can be serialized to dict."""
        data = sample_run_error.model_dump()

        assert data["error_class"] == "ValueError"
        assert data["message"] == "Invalid data"
        assert isinstance(data["traceback"], list)
        assert len(data["traceback"]) == 2

    def test_deserialization(self, sample_traceback: list[str]) -> None:
        """Test that RunError can be deserialized from dict."""
        data = {
            "error_class": "RuntimeError",
            "message": "Something went wrong",
            "traceback": sample_traceback,
        }

        error = RunError(**data)

        assert error.error_class == "RuntimeError"
        assert error.message == "Something went wrong"
        assert error.traceback == sample_traceback

    def test_serialization_with_optional_fields(self, sample_traceback: list[str]) -> None:
        """Test serialization includes optional fields when present."""
        error = RunError(
            error_class="RuntimeError",
            message="Something failed",
            traceback=sample_traceback,
            details_headline="Execution Error",
            details="Check the logs for more information",
        )

        serialized = error.model_dump()
        assert "details_headline" in serialized
        assert serialized["details_headline"] == "Execution Error"
        assert "details" in serialized
        assert serialized["details"] == "Check the logs for more information"

    def test_deserialization_with_optional_fields(self, sample_traceback: list[str]) -> None:
        """Test deserialization with optional fields."""
        data = {
            "error_class": "ValueError",
            "message": "Test error",
            "traceback": sample_traceback,
            "details_headline": "Test Headline",
            "details": "Test Details",
        }

        error = RunError(**data)
        assert error.details_headline == "Test Headline"
        assert error.details == "Test Details"

    def test_deserialization_without_optional_fields(self, sample_traceback: list[str]) -> None:
        """Test deserialization without optional fields."""
        data = {
            "error_class": "ValueError",
            "message": "Test error",
            "traceback": sample_traceback,
        }

        error = RunError(**data)
        assert error.details_headline is None
        assert error.details is None


class TestStateUpdate:
    """Tests for the StateUpdate model."""

    def test_nested_key_path(self) -> None:
        """Test StateUpdate with nested key path (dot notation)."""
        update = StateUpdate(
            key="qubit_0.readout.resonator",
            attr="frequency",
            old=7.0e9,
            new=7.1e9,
            updated=True,
        )

        assert update.key == "qubit_0.readout.resonator"
        assert "." in update.key

    def test_serialization(self, sample_state_update: StateUpdate) -> None:
        """Test that StateUpdate can be serialized to dict."""
        data = sample_state_update.model_dump()

        assert data["key"] == "qubit_0"
        assert data["attr"] == "resonance_frequency"
        assert data["old"] == 5.0e9
        assert data["new"] == 5.1e9
        assert data["updated"] is True

    def test_deserialization(self) -> None:
        """Test that StateUpdate can be deserialized from dict."""
        data = {
            "key": "qubit_2",
            "attr": "T1",
            "old": 50e-6,
            "new": 55e-6,
            "updated": True,
        }

        update = StateUpdate(**data)

        assert update.key == "qubit_2"
        assert update.attr == "T1"
        assert update.old == 50e-6
        assert update.new == 55e-6
        assert update.updated is True
