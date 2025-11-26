"""
Tests for common models: RunError and StateUpdate.

These models are used to capture error information and state changes
during calibration execution.
"""

import pytest

from qualibrate_runner.core.models.common import RunError, StateUpdate


class TestRunError:
    """Tests for the RunError model."""

    def test_create_with_all_fields(self, sample_traceback):
        """Test creating RunError with all required fields."""
        error = RunError(
            error_class="ValueError",
            message="Test error message",
            traceback=sample_traceback,
        )

        assert error.error_class == "ValueError"
        assert error.message == "Test error message"
        assert error.traceback == sample_traceback
        assert len(error.traceback) == 2

    def test_create_from_exception(self):
        """Test creating RunError from a real exception."""
        import traceback as tb

        try:
            raise ValueError("Test exception")
        except ValueError as e:
            error = RunError(
                error_class=type(e).__name__,
                message=str(e),
                traceback=tb.format_tb(e.__traceback__),
            )

        assert error.error_class == "ValueError"
        assert error.message == "Test exception"
        assert len(error.traceback) > 0
        assert any("raise ValueError" in line for line in error.traceback)

    def test_serialization(self, sample_run_error):
        """Test that RunError can be serialized to dict."""
        data = sample_run_error.model_dump()

        assert data["error_class"] == "ValueError"
        assert data["message"] == "Invalid data"
        assert isinstance(data["traceback"], list)
        assert len(data["traceback"]) == 2

    def test_deserialization(self, sample_traceback):
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

    def test_different_error_classes(self):
        """Test RunError with various exception types."""
        error_types = [
            "ValueError",
            "KeyError",
            "RuntimeError",
            "AttributeError",
            "TypeError",
            "CustomCalibrationError",
        ]

        for error_type in error_types:
            error = RunError(
                error_class=error_type,
                message=f"Test {error_type}",
                traceback=[],
            )
            assert error.error_class == error_type

    def test_multiline_error_message(self):
        """Test RunError with multiline error message."""
        multiline_message = """First line of error
Second line with details
Third line with more context"""

        error = RunError(
            error_class="ValueError",
            message=multiline_message,
            traceback=[],
        )

        assert error.message == multiline_message
        assert "\n" in error.message

    def test_long_traceback(self):
        """Test RunError with a long traceback (many frames)."""
        long_traceback = [
            f'  File "/path/frame_{i}.py", line {i * 10}, in func_{i}\n'
            for i in range(20)
        ]

        error = RunError(
            error_class="DeepCallStackError",
            message="Error from deep call stack",
            traceback=long_traceback,
        )

        assert len(error.traceback) == 20

    def test_create_with_optional_detail_fields(self, sample_traceback):
        """Test creating RunError with optional detail fields."""
        error = RunError(
            error_class="ValueError",
            message="Invalid configuration",
            traceback=sample_traceback,
            details_headline="Configuration Error",
            details="The 'frequency' parameter must be greater than zero.",
        )

        assert error.error_class == "ValueError"
        assert error.details_headline == "Configuration Error"
        assert (
            error.details
            == "The 'frequency' parameter must be greater than zero."
        )

    def test_create_without_optional_detail_fields(self, sample_traceback):
        """Test that optional detail fields default to None."""
        error = RunError(
            error_class="ValueError",
            message="Test error",
            traceback=sample_traceback,
        )

        assert error.details_headline is None
        assert error.details is None

    def test_serialization_with_optional_fields(self, sample_traceback):
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

    def test_deserialization_with_optional_fields(self, sample_traceback):
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

    def test_deserialization_without_optional_fields(self, sample_traceback):
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

    def test_create_with_all_fields(self):
        """Test creating StateUpdate with all fields."""
        update = StateUpdate(
            key="qubit_0",
            attr="resonance_frequency",
            old=5.0e9,
            new=5.1e9,
            updated=True,
        )

        assert update.key == "qubit_0"
        assert update.attr == "resonance_frequency"
        assert update.old == 5.0e9
        assert update.new == 5.1e9
        assert update.updated is True

    def test_create_with_default_updated_false(self):
        """Test that updated defaults to False."""
        update = StateUpdate(
            key="qubit_1",
            attr="pi_pulse_amplitude",
            old=0.5,
            new=0.6,
        )

        assert update.updated is False

    def test_string_attribute(self):
        """Test StateUpdate with string attribute name."""
        update = StateUpdate(
            key="resonator_0",
            attr="wiring",
            old="port_1",
            new="port_2",
            updated=True,
        )

        assert update.attr == "wiring"
        assert isinstance(update.attr, str)

    def test_integer_attribute_for_list_index(self):
        """Test StateUpdate with integer attribute (list index)."""
        update = StateUpdate(
            key="calibration_array",
            attr=3,  # Index in list
            old=0.1,
            new=0.2,
            updated=True,
        )

        assert update.attr == 3
        assert isinstance(update.attr, int)

    def test_various_value_types(self):
        """Test StateUpdate with different value types."""
        # Float values
        update_float = StateUpdate(
            key="qubit_0", attr="frequency", old=5.0e9, new=5.1e9
        )
        assert isinstance(update_float.old, float)

        # Integer values
        update_int = StateUpdate(
            key="qubit_0", attr="num_gates", old=10, new=15
        )
        assert isinstance(update_int.old, int)

        # String values
        update_str = StateUpdate(
            key="qubit_0", attr="state", old="|0>", new="|1>"
        )
        assert isinstance(update_str.old, str)

        # Boolean values
        update_bool = StateUpdate(
            key="qubit_0", attr="enabled", old=False, new=True
        )
        assert isinstance(update_bool.old, bool)

        # None values
        update_none = StateUpdate(
            key="qubit_0", attr="optional_param", old=None, new=42
        )
        assert update_none.old is None

        # List values
        update_list = StateUpdate(
            key="qubit_0", attr="calibration_points", old=[1, 2], new=[1, 2, 3]
        )
        assert isinstance(update_list.old, list)

        # Dict values
        update_dict = StateUpdate(
            key="qubit_0",
            attr="config",
            old={"a": 1},
            new={"a": 1, "b": 2},
        )
        assert isinstance(update_dict.old, dict)

    def test_nested_key_path(self):
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

    def test_serialization(self, sample_state_update):
        """Test that StateUpdate can be serialized to dict."""
        data = sample_state_update.model_dump()

        assert data["key"] == "qubit_0"
        assert data["attr"] == "resonance_frequency"
        assert data["old"] == 5.0e9
        assert data["new"] == 5.1e9
        assert data["updated"] is True

    def test_deserialization(self):
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

    def test_no_change_update(self):
        """Test StateUpdate where old and new values are the same."""
        update = StateUpdate(
            key="qubit_0",
            attr="frequency",
            old=5.0e9,
            new=5.0e9,
            updated=False,
        )

        # Values can be the same, it's valid
        assert update.old == update.new
        assert update.updated is False

    def test_update_to_none(self):
        """Test StateUpdate where new value is None (clearing a value)."""
        update = StateUpdate(
            key="qubit_0",
            attr="optional_correction",
            old=0.05,
            new=None,
            updated=True,
        )

        assert update.old == 0.05
        assert update.new is None

    def test_update_from_none(self):
        """Test StateUpdate where old value is None (setting initial value)."""
        update = StateUpdate(
            key="qubit_0",
            attr="new_parameter",
            old=None,
            new=0.1,
            updated=True,
        )

        assert update.old is None
        assert update.new == 0.1

    def test_complex_number_values(self):
        """Test StateUpdate with complex number values."""
        update = StateUpdate(
            key="mixer_0",
            attr="iq_imbalance",
            old=complex(1.0, 0.1),
            new=complex(1.0, 0.05),
            updated=True,
        )

        assert isinstance(update.old, complex)
        assert isinstance(update.new, complex)

    def test_very_long_key(self):
        """Test StateUpdate with very long nested key path."""
        long_key = (
            "system.rack_1.chassis_2.module_3.channel_4.qubit_5.subsystem_6"
        )

        update = StateUpdate(
            key=long_key, attr="parameter", old=0, new=1, updated=True
        )

        assert update.key == long_key
        assert update.key.count(".") == 6
