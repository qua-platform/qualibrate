from enum import Enum

import pytest
from pydantic import ValidationError

from qualibrate.parameters import GraphParameters, NodeParameters

class Color(Enum):
    RED = "Red"
    GREEN = "Green"
    BLUE = "Blue"


class TestCreateParameters:
    class SampleNodeParameters(NodeParameters):
        qubits: list[str] | None = None
        other_param: str = "test"

    class SampleNodeParametersWithEnum(NodeParameters):
        qubits: list[str] | None = None
        other_param: str = "test"
        color : Color = Color.RED

    class SampleGraphParameters(GraphParameters):
        qubits: list[str] | None = None
        other_param: str = "test"

    class SampleGraphParametersWithEnum(GraphParameters):
        qubits: list[str] | None = None
        other_param: str = "test"
        color : Color = Color.RED

    @pytest.mark.parametrize(
        "parameters_class", [SampleNodeParameters, SampleGraphParameters]
    )
    def test_forbid_extra_parameters(self, parameters_class):
        with pytest.raises(ValidationError) as ex:
            parameters_class.model_validate({"invalid_key": None})
        errors = ex.value.errors()
        assert errors[0]["type"] == "extra_forbidden"
        assert errors[0]["loc"] == ("invalid_key",)

    def test_node_targets_name(self):
        assert NodeParameters.targets_name == "qubits"

    def test_graph_targets_name(self):
        assert GraphParameters.targets_name == "qubits"

    @pytest.mark.parametrize(
        "parameters_class", [SampleNodeParameters, SampleGraphParameters]
    )
    def test_serialize_include_targets(self, parameters_class):
        assert parameters_class.serialize(exclude_targets=False) == {
            "qubits": {
                "anyOf": [
                    {"items": {"type": "string"}, "type": "array"},
                    {"type": "null"},
                ],
                "default": None,
                "title": "Qubits",
                "is_targets": True,
            },
            "other_param": {
                "default": "test",
                "title": "Other Param",
                "type": "string",
                "is_targets": False,
            },
        }

    @pytest.mark.parametrize(
        "parameters_class", [SampleNodeParameters, SampleGraphParameters]
    )
    def test_serialize_exclude_targets(self, parameters_class):
        assert parameters_class.serialize(exclude_targets=True) == {
            "other_param": {
                "default": "test",
                "title": "Other Param",
                "type": "string",
                "is_targets": False,
            }
        }

    @pytest.mark.parametrize(
        "parameters_class", [SampleNodeParameters, SampleGraphParameters]
    )
    def test_serialize_no_exclude_param(self, parameters_class):
        assert parameters_class.serialize() == {
            "qubits": {
                "anyOf": [
                    {"items": {"type": "string"}, "type": "array"},
                    {"type": "null"},
                ],
                "default": None,
                "title": "Qubits",
                "is_targets": True,
            },
            "other_param": {
                "default": "test",
                "title": "Other Param",
                "type": "string",
                "is_targets": False,
            },
        }

    @pytest.mark.parametrize(
        "parameters_class", [SampleNodeParametersWithEnum,SampleGraphParametersWithEnum]
    )
    def test_serialize_includes_enum_values(self, parameters_class):
        serialized = parameters_class.serialize(exclude_targets=False)
        # Ensure 'color' field has enum values
        assert "color" in serialized
        assert "enum" in serialized["color"]
        enum_values = serialized["color"]["enum"]
        expected_values = [e.value for e in Color]
        assert set(enum_values) == set(expected_values)
        assert serialized["color"]["default"] == Color.RED.value

    @pytest.mark.parametrize(
        "parameters_class", [SampleNodeParametersWithEnum, SampleGraphParametersWithEnum]
    )
    def test_serialize_exclude_targets_enum(self, parameters_class):
        serialized = parameters_class.serialize(exclude_targets=True)
        # 'color' is not a target field, so should be present
        assert "color" in serialized

    @pytest.mark.parametrize(
        "parameters_class", [SampleNodeParametersWithEnum, SampleGraphParametersWithEnum]
    )
    def test_serialize_include_targets_with_enum(self, parameters_class):
        expected = {
            "qubits": {
                "anyOf": [
                    {"items": {"type": "string"}, "type": "array"},
                    {"type": "null"},
                ],
                "default": None,
                "title": "Qubits",
                "is_targets": True,
            },
            "other_param": {
                "default": "test",
                "title": "Other Param",
                "type": "string",
                "is_targets": False,
            },
            "color": {
                "default": "Red",
                "enum": ["Red", "Green", "Blue"],
                "title": "Color",
                "type": "string",
                "is_targets": False,
            },
        }
        assert parameters_class.serialize(exclude_targets=False) == expected