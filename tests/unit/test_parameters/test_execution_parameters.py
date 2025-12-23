from email.policy import default

import pytest
from pydantic import Field

from qualibrate.parameters import (
    ExecutionParameters,
    GraphElementsParameters,
    GraphParameters,
    NodeParameters,
    RunnableParameters,
)
from qualibrate.utils.type_protocols import TargetType


class Node1(NodeParameters):
    qubits: list[TargetType] | None = Field(
        default_factory=lambda: ["a", "b", "c"]
    )
    int_value: int = 1


class Node2(NodeParameters):
    qubits: list[TargetType] | None = Field(
        default_factory=lambda: ["d", "e", "f"]
    )
    float_value: float = 2.0


class Graph(GraphParameters):
    qubits: list[TargetType] = Field(default_factory=lambda: ["1", "2", "3"])
    str_value: str = "test"


class NodesParams(GraphElementsParameters):
    node1: Node1 = Field(default_factory=Node1)
    node2: Node2 = Field(default_factory=Node2)


class ExecutionParams(ExecutionParameters):
    parameters: Graph = Field(default_factory=Graph)
    nodes: NodesParams = Field(default_factory=NodesParams)


class TestExecutionParameters:
    def test_default_initialization(self):
        instance = ExecutionParameters()
        assert isinstance(instance.parameters, GraphParameters)
        assert isinstance(instance.nodes, GraphElementsParameters)

    def test_serialize_with_additional_fields(self):
        class ExtendedExecutionParameters(ExecutionParameters):
            extra_field: str = "extra"

        serialized = ExtendedExecutionParameters.serialize()
        assert "parameters" in serialized
        assert "nodes" in serialized
        assert "extra_field" in serialized

    def test_serialize_exclude_targets_default(self):
        assert ExecutionParams.serialize() == {
            "parameters": {
                "qubits": {
                    "items": {"type": "string"},
                    "type": "array",
                    "title": "Qubits",
                    "is_targets": True,
                },
                "str_value": {
                    "default": "test",
                    "title": "Str Value",
                    "type": "string",
                    "is_targets": False,
                },
            },
            "nodes": {
                "node1": {
                    "int_value": {
                        "default": 1,
                        "title": "Int Value",
                        "type": "integer",
                        "is_targets": False,
                    }
                },
                "node2": {
                    "float_value": {
                        "default": 2.0,
                        "title": "Float Value",
                        "type": "number",
                        "is_targets": False,
                    }
                },
            },
        }

    def test_serialize_force_exclude_targets(self):
        assert ExecutionParams.serialize(exclude_targets=True) == {
            "parameters": {
                "str_value": {
                    "default": "test",
                    "title": "Str Value",
                    "type": "string",
                    "is_targets": False,
                }
            },
            "nodes": {
                "node1": {
                    "int_value": {
                        "default": 1,
                        "title": "Int Value",
                        "type": "integer",
                        "is_targets": False,
                    }
                },
                "node2": {
                    "float_value": {
                        "default": 2.0,
                        "title": "Float Value",
                        "type": "number",
                        "is_targets": False,
                    }
                },
            },
        }

    def test_serialize_force_not_exclude_targets(self):
        assert ExecutionParams.serialize(exclude_targets=False) == {
            "parameters": {
                "qubits": {
                    "items": {"type": "string"},
                    "type": "array",
                    "title": "Qubits",
                    "is_targets": True,
                },
                "str_value": {
                    "default": "test",
                    "title": "Str Value",
                    "type": "string",
                    "is_targets": False,
                },
            },
            "nodes": {
                "node1": {
                    "qubits": {
                        "anyOf": [
                            {"items": {"type": "string"}, "type": "array"},
                            {"type": "null"},
                        ],
                        # "default": ["a", "b", "c"],
                        "title": "Qubits",
                        "is_targets": True,
                    },
                    "int_value": {
                        "default": 1,
                        "title": "Int Value",
                        "type": "integer",
                        "is_targets": False,
                    },
                },
                "node2": {
                    "qubits": {
                        "anyOf": [
                            {"items": {"type": "string"}, "type": "array"},
                            {"type": "null"},
                        ],
                        # "default": ["d", "e", "f"],
                        "title": "Qubits",
                        "is_targets": True,
                    },
                    "float_value": {
                        "default": 2.0,
                        "title": "Float Value",
                        "type": "number",
                        "is_targets": False,
                    },
                },
            },
        }

    def test_serialize_with_none_parameters_class(self, mocker):
        mock_model_fields = mocker.patch(
            "qualibrate.parameters.ExecutionParameters.model_fields"
        )
        mock_model_fields.__getitem__.return_value = mocker.MagicMock(
            annotation=None
        )

        with pytest.raises(
            RuntimeError, match="Graph parameters class can't be none"
        ):
            ExecutionParameters.serialize()

    def test_serialize_none_parameters_class(self, mocker):
        mock_model_fields = mocker.patch(
            "qualibrate.parameters.ExecutionParameters.model_fields"
        )
        mock_model_fields.__getitem__.return_value = mocker.MagicMock(
            annotation=RunnableParameters
        )

        with pytest.raises(
            RuntimeError,
            match=(
                "Graph parameters class should be subclass of "
                "qualibrate.parameters.GraphParameters"
            ),
        ):
            ExecutionParameters.serialize()

#
# class Color(Enum):
#     RED = "red"
#     GREEN = "green"
#     BLUE = "blue"
#
#
# class Priority(Enum):
#     LOW = 1
#     MEDIUM = 2
#     HIGH = 3
#
#
# class ComprehensiveParameters(NodeParameters):
#     """Test all parameter types that should be supported"""
#     # Required for NodeParameters
#     qubits: list[str] = Field(default_factory=list)
#
#     # Simple types (should already work)
#     str_value: str = "test"
#     int_value: int = 1
#     float_value: float = 1.0
#     bool_value: bool = True
#     none_value: Optional[str] = None
#
#     # Collections (should already work)
#     list_value: list[int] = Field(default_factory=lambda: [1, 2, 3])
#     dict_value: dict[str, int] = Field(default_factory=lambda: {"a": 1})
#
#     # Enums (the new case we're fixing)
#     color_enum: Color = Color.RED
#     priority_enum: Priority = Priority.MEDIUM
#     optional_enum: Optional[Color] = None
#
#
# def test_node_serialization():
#     """Test that node with comprehensive parameters can be created and serialized"""
#     print("=" * 80)
#     print("TEST 1: Node Creation and Serialization")
#     print("=" * 80)
#
#     try:
#         # Create node with comprehensive parameters
#         node = QualibrationNode("test_node", parameters=ComprehensiveParameters())
#         print("✓ Node created successfully")
#
#         # Test serialization
#         serialized = node.serialize()
#         print("✓ Node serialized successfully")
#         print(f"  Serialized keys: {list(serialized.keys())}")
#
#         # Check parameters are in serialized output
#         assert "parameters" in serialized, "Missing 'parameters' in serialized output"
#         params = serialized["parameters"]
#         print(f"  Parameter keys: {list(params.keys())}")
#
#         # Verify all fields are present
#         expected_fields = [
#             "qubits", "str_value", "int_value", "float_value", "bool_value",
#             "none_value", "list_value", "dict_value", "color_enum",
#             "priority_enum", "optional_enum"
#         ]
#
#         for field in expected_fields:
#             assert field in params, f"Missing field '{field}' in serialized parameters"
#             print(f"  ✓ Field '{field}' present: {params[field]}")
#
#         print("\n✓ All parameter fields serialized correctly\n")
#         return True
#
#     except Exception as e:
#         print(f"✗ FAILED: {e}")
#         import traceback
#         traceback.print_exc()
#         return False
#
#
# def test_graph_with_enum_parameters():
#     """Test that graph can handle nodes with enum parameters"""
#     print("=" * 80)
#     print("TEST 2: Graph with Enum Parameters")
#     print("=" * 80)
#
#     try:
#         # Create and register node in library
#         library = QualibrationLibrary.get_active_library(create=True)
#         node = QualibrationNode("enum_test_node", parameters=ComprehensiveParameters())
#         library.nodes.add(node)
#         print("✓ Node added to library")
#
#         # Create graph with the node
#         with QualibrationGraph.build("test_graph") as graph:
#             graph.add_node(library.nodes.get_nocopy("enum_test_node").copy(name="node1"))
#             graph.add_node(library.nodes.get_nocopy("enum_test_node").copy(name="node2"))
#             graph.connect("node1", "node2")
#
#         print("✓ Graph built successfully")
#
#         # Test that full_parameters_class was built correctly
#         full_params_class = graph.full_parameters_class
#         print(f"✓ Full parameters class created: {full_params_class.__name__}")
#
#         # Verify the structure
#         assert hasattr(full_params_class, 'model_fields'), "Missing model_fields"
#         assert 'parameters' in full_params_class.model_fields, "Missing 'parameters' field"
#         assert 'nodes' in full_params_class.model_fields, "Missing 'nodes' field"
#         print("✓ Full parameters class has correct structure")
#
#         # Test serialization of the graph
#         serialized = graph.serialize()
#         print("✓ Graph serialized successfully")
#
#         # Verify nodes parameters are in serialized output
#         assert "nodes" in serialized, "Missing 'nodes' in serialized output"
#         nodes_data = serialized["nodes"]
#         assert "node1" in nodes_data, "Missing 'node1' in nodes"
#         assert "node2" in nodes_data, "Missing 'node2' in nodes"
#         print(f"  ✓ Node1 parameters: {list(nodes_data['node1'].keys())}")
#         print(f"  ✓ Node2 parameters: {list(nodes_data['node2'].keys())}")
#
#         # Verify enum fields are present in node parameters
#         node1_params = nodes_data["node1"]
#         if "parameters" in node1_params:
#             node1_params = node1_params["parameters"]
#
#         assert "color_enum" in node1_params, "Missing 'color_enum' in node1 parameters"
#         assert "priority_enum" in node1_params, "Missing 'priority_enum' in node1 parameters"
#         print(
#             f"  ✓ Enum fields present in node1: color={node1_params['color_enum']}, priority={node1_params['priority_enum']}")
#
#         print("\n✓ Graph with enum parameters works correctly\n")
#         return True
#
#     except Exception as e:
#         print(f"✗ FAILED: {e}")
#         import traceback
#         traceback.print_exc()
#         return False
#
#
# def test_parameter_class_serialize():
#     """Test the serialize() class method directly"""
#     print("=" * 80)
#     print("TEST 3: Direct Parameter Serialization")
#     print("=" * 80)
#
#     try:
#         # Test the serialize method
#         serialized = ComprehensiveParameters.serialize()
#         print("✓ Parameters class serialized successfully")
#         print(f"  Serialized structure: {list(serialized.keys())}")
#
#         # Verify all fields are present
#         expected_fields = [
#             "qubits", "str_value", "int_value", "float_value", "bool_value",
#             "none_value", "list_value", "dict_value", "color_enum",
#             "priority_enum", "optional_enum"
#         ]
#
#         for field in expected_fields:
#             assert field in serialized, f"Missing field '{field}' in serialized class"
#             field_info = serialized[field]
#             print(f"  ✓ Field '{field}': {field_info}")
#
#         print("\n✓ Direct serialization works correctly\n")
#         return True
#
#     except Exception as e:
#         print(f"✗ FAILED: {e}")
#         import traceback
#         traceback.print_exc()
#         return False
#
#
# def test_enum_schema_structure():
#     """Test that enum schema is correctly structured after serialization"""
#     print("=" * 80)
#     print("TEST 4: Enum Schema Structure Validation")
#     print("=" * 80)
#
#     try:
#         serialized = ComprehensiveParameters.serialize()
#
#         # Check color_enum structure
#         color_schema = serialized["color_enum"]
#         print(f"  Color enum schema: {color_schema}")
#
#         # Should have type information
#         assert "type" in color_schema or "enum" in color_schema or "allOf" in color_schema, \
#             "Enum schema missing type information"
#
#         # Check priority_enum structure
#         priority_schema = serialized["priority_enum"]
#         print(f"  Priority enum schema: {priority_schema}")
#
#         assert "type" in priority_schema or "enum" in priority_schema or "allOf" in priority_schema, \
#             "Enum schema missing type information"
#
#         print("\n✓ Enum schemas are properly structured\n")
#         return True
#
#     except Exception as e:
#         print(f"✗ FAILED: {e}")
#         import traceback
#         traceback.print_exc()
#         return False
#
#
# if __name__ == "__main__":
#     print("\n" + "=" * 80)
#     print("RUNNING COMPREHENSIVE PARAMETER SERIALIZATION TESTS")
#     print("=" * 80 + "\n")
#
#     results = []
#
#     # Run all tests
#     results.append(("Node Serialization", test_node_serialization()))
#     results.append(("Graph with Enums", test_graph_with_enum_parameters()))
#     results.append(("Direct Serialization", test_parameter_class_serialize()))
#     results.append(("Enum Schema Structure", test_enum_schema_structure()))
#
#     # Summary
#     print("\n" + "=" * 80)
#     print("TEST SUMMARY")
#     print("=" * 80)
#
#     for test_name, passed in results:
#         status = "✓ PASSED" if passed else "✗ FAILED"
#         print(f"{status}: {test_name}")
#
#     all_passed = all(result[1] for result in results)
#
#     print("=" * 80)
#     if all_passed:
#         print("✓ ALL TESTS PASSED - Serialization working correctly!")
#     else:
#         print("✗ SOME TESTS FAILED - Review failures above")
#     print("=" * 80 + "\n")