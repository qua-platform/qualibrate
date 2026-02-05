from dataclasses import field

import pytest
from pydantic import Field

from qualibrate.core import NodeParameters, QualibrationNode


class TestRecordStateUpdates:
    @pytest.fixture
    def machine(self):
        from quam.components import SingleChannel
        from quam.core import QuamRoot, quam_dataclass

        @quam_dataclass
        class QuamTest(QuamRoot):
            channels: dict[str, SingleChannel] = field(default_factory=dict)
            str_value: str = "test"
            int_value: int = 1
            float_value: float = 1.0
            dict_value: dict = field(default_factory=lambda: {"a": 1, "b": 2})
            empty_dict_value: dict = field(default_factory=dict)

        machine = QuamTest(
            channels={"ch1": SingleChannel(opx_output=("con1", 1), intermediate_frequency=100e6)},
        )
        return machine

    @pytest.fixture
    def node(self, qualibrate_config_and_path_mocked, machine):
        class Parameters(NodeParameters):
            qubits: list[str] = Field(default_factory=list)

            str_value: str = "test"
            int_value: int = 1
            float_value: float = 1.0

        node = QualibrationNode("test_node", parameters=Parameters())
        node.machine = machine
        return node

    def test_record_state_updates_basic(self, node):
        channel = node.machine.channels["ch1"]
        assert channel.intermediate_frequency == 100e6

        with node.record_state_updates(interactive_only=False):
            channel.intermediate_frequency = 50e6

        assert channel.intermediate_frequency == 100e6
        assert node.state_updates == {
            "#/channels/ch1/intermediate_frequency": {
                "key": "#/channels/ch1/intermediate_frequency",
                "attr": "intermediate_frequency",
                "new": 50e6,
                "old": 100e6,
            }
        }

    def test_record_state_updates_interactive(self, node):
        channel = node.machine.channels["ch1"]
        node.modes.interactive = True
        assert channel.intermediate_frequency == 100e6

        with node.record_state_updates():
            channel.intermediate_frequency = 50e6

        assert channel.intermediate_frequency == 100e6
        assert node.state_updates == {
            "#/channels/ch1/intermediate_frequency": {
                "key": "#/channels/ch1/intermediate_frequency",
                "attr": "intermediate_frequency",
                "new": 50e6,
                "old": 100e6,
            }
        }

    def test_record_state_updates_non_interactive(self, node: QualibrationNode):
        channel = node.machine.channels["ch1"]
        assert channel.intermediate_frequency == 100e6

        with node.record_state_updates():
            channel.intermediate_frequency = 50e6

        assert channel.intermediate_frequency == 50e6
        assert node.state_updates == {}

    def test_record_state_updates_new_dict_value(self, node, machine):
        assert node.machine.dict_value == {"a": 1, "b": 2}

        with node.record_state_updates(interactive_only=False):
            node.machine.dict_value["c"] = 3

        assert node.machine.dict_value == {"a": 1, "b": 2, "c": 3}
        assert node.state_updates == {}

    def test_record_state_updates_replace_dict_value(self, node, machine):
        assert node.machine.dict_value == {"a": 1, "b": 2}

        with node.record_state_updates(interactive_only=False):
            node.machine.dict_value["b"] = 3

        # Should revert back to original value
        assert node.machine.dict_value == {"a": 1, "b": 2}
        assert node.state_updates == {
            "#/dict_value/b": {
                "key": "#/dict_value/b",
                "attr": "b",
                "new": 3,
                "old": 2,
            }
        }

    def test_record_state_updates_plus_equals_operation(self, node):
        """Test that += operations on int values are recorded correctly."""
        assert node.machine.int_value == 1

        with node.record_state_updates(interactive_only=False):
            node.machine.int_value += 1

        # Should revert to original value
        assert node.machine.int_value == 1
        assert node.state_updates == {
            "#/int_value": {
                "key": "#/int_value",
                "attr": "int_value",
                "new": 2,
                "old": 1,
            }
        }

    def test_record_state_updates_empty_dict_new_entry(self, node):
        """Test that adding entries to an empty dict is recorded correctly."""
        assert node.machine.empty_dict_value == {}

        with node.record_state_updates(interactive_only=False):
            node.machine.empty_dict_value["new_key"] = "new_value"

        # Should revert to original empty state
        assert node.machine.empty_dict_value == {"new_key": "new_value"}
        assert node.state_updates == {}

    def test_record_state_updates_chained_operations(self, node):
        """Test that chained operations use updated values correctly."""
        assert node.machine.int_value == 1
        assert node.machine.float_value == 1.0

        with node.record_state_updates(interactive_only=False):
            # First increment the int value
            node.machine.int_value += 1
            # Then add the updated int value to the float value
            node.machine.float_value += node.machine.int_value

        # Both should revert to original values
        assert node.machine.int_value == 1
        assert node.machine.float_value == 1.0

        # Float value should show it was updated with the new int value (2),
        # not the original (1)
        assert node.state_updates == {
            "#/int_value": {
                "key": "#/int_value",
                "attr": "int_value",
                "new": 2,
                "old": 1,
            },
            "#/float_value": {
                "key": "#/float_value",
                "attr": "float_value",
                "new": 3.0,  # 1.0 + 2 (updated int_value)
                "old": 1.0,
            },
        }

    def test_record_state_updates_multiple_changes_same_attribute(self, node):
        """Test that multiple changes to the same attribute record the final
        value."""
        assert node.machine.int_value == 1

        with node.record_state_updates(interactive_only=False):
            node.machine.int_value = 5
            node.machine.int_value = 10
            node.machine.int_value += 5  # Final value should be 15

        # Should revert to original value
        assert node.machine.int_value == 1
        # Should record original -> final change
        assert node.state_updates == {
            "#/int_value": {
                "key": "#/int_value",
                "attr": "int_value",
                "new": 15,
                "old": 1,
            }
        }

    def test_record_state_updates_string_concatenation(self, node):
        """Test that string operations like += concatenation are
        recorded."""
        assert node.machine.str_value == "test"

        with node.record_state_updates(interactive_only=False):
            node.machine.str_value += "_suffix"

        # Should revert to original value
        assert node.machine.str_value == "test"
        assert node.state_updates == {
            "#/str_value": {
                "key": "#/str_value",
                "attr": "str_value",
                "new": "test_suffix",
                "old": "test",
            }
        }

    def test_record_state_updates_mixed_dict_operations(self, node):
        """Test mixed operations on dict - modifying existing and adding
        new."""
        assert node.machine.dict_value == {"a": 1, "b": 2}

        with node.record_state_updates(interactive_only=False):
            # Modify existing key
            node.machine.dict_value["a"] = 10
            # Add new key
            node.machine.dict_value["c"] = 3

        # Should revert all changes
        assert node.machine.dict_value == {"a": 1, "b": 2, "c": 3}

        assert node.state_updates == {
            "#/dict_value/a": {
                "key": "#/dict_value/a",
                "attr": "a",
                "new": 10,
                "old": 1,
            },
        }

    def test_record_state_updates_complex_object_replacement(self, node):
        assert node.machine.dict_value == {"a": 1, "b": 2}

        with node.record_state_updates(interactive_only=False):
            node.machine.dict_value["a"] = {"new_value": 10}

        # Should not revert as it's not a simple replacement
        assert node.machine.dict_value == {"a": {"new_value": 10}, "b": 2}
        assert node.state_updates == {}

    def test_record_state_updates_complex_object_add_new_key(self, node):
        assert node.machine.dict_value == {"a": 1, "b": 2}

        with node.record_state_updates(interactive_only=False):
            node.machine.dict_value["c"] = {"new_value": 10}

        assert node.machine.dict_value == {
            "a": 1,
            "b": 2,
            "c": {"new_value": 10},
        }
        assert node.state_updates == {}
