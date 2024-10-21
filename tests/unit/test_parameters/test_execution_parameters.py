from typing import List, Optional

import pytest
from pydantic import Field

from qualibrate.parameters import (
    ExecutionParameters,
    GraphParameters,
    NodeParameters,
    NodesParameters,
    RunnableParameters,
)
from qualibrate.utils.type_protocols import TargetType


class Node1(NodeParameters):
    qubits: Optional[List[TargetType]] = Field(
        default_factory=lambda: ["a", "b", "c"]
    )
    int_value: int = 1


class Node2(NodeParameters):
    qubits: Optional[List[TargetType]] = Field(
        default_factory=lambda: ["d", "e", "f"]
    )
    float_value: float = 2.0


class Graph(GraphParameters):
    qubits: List[TargetType] = Field(default_factory=lambda: ["1", "2", "3"])
    str_value: str = "test"


class NodesParams(NodesParameters):
    node1: Node1 = Field(default_factory=Node1)
    node2: Node2 = Field(default_factory=Node2)


class ExecutionParams(ExecutionParameters):
    parameters: Graph = Field(default_factory=Graph)
    nodes: NodesParams = Field(default_factory=NodesParams)


class TestExecutionParameters:
    def test_default_initialization(self):
        instance = ExecutionParameters()
        assert isinstance(instance.parameters, GraphParameters)
        assert isinstance(instance.nodes, NodesParameters)

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
                            "default": ["a", "b", "c"],
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
                            "default": ["d", "e", "f"],
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
                match="Graph parameters class should be subclass of qualibrate.parameters.GraphParameters",
            ):
                ExecutionParameters.serialize()
