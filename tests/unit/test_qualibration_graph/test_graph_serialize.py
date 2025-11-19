from collections.abc import Sequence
from typing import Any

from qualibrate.models.node_status import ElementRunStatus
from qualibrate.orchestration.qualibration_orchestrator import (
    QualibrationOrchestrator,
)
from qualibrate.parameters import (
    GraphParameters,
)
from qualibrate.qualibration_graph import QualibrationGraph
from qualibrate.qualibration_library import QualibrationLibrary


class Orchestrator(QualibrationOrchestrator):
    def traverse_graph(
        self, graph: QualibrationGraph, targets: Sequence[Any]
    ) -> None:
        pass


def test_serialize(
    qualibration_lib: QualibrationLibrary, graph_params: GraphParameters
):
    g = QualibrationGraph(
        "name",
        graph_params,
        dict(qualibration_lib.nodes.items()),
        [("test_node", "one_more_node"), ("one_more_node", "test_cal")],
        orchestrator=Orchestrator(),
        description="some description",
    )
    assert g.serialize() == {
        "name": "name",
        "description": "some description",
        "orchestrator": {
            "__class__": (
                "tests.unit.test_qualibration_graph.test_graph_serialize"
                ".Orchestrator"
            ),
            "parameters": {},
        },
        "nodes": {
            "test_node": {
                "status": ElementRunStatus.pending,
                "id": "test_node",
                "name": "test_node",
                "parameters": {
                    "str_value": {
                        "default": "test",
                        "title": "Str Value",
                        "type": "string",
                        "is_targets": False,
                    },
                    "int_value": {
                        "default": 1,
                        "title": "Int Value",
                        "type": "integer",
                        "is_targets": False,
                    },
                    "float_value": {
                        "default": 1.0,
                        "title": "Float Value",
                        "type": "number",
                        "is_targets": False,
                    },
                },
            },
            "one_more_node": {
                "status": ElementRunStatus.pending,
                "id": "one_more_node",
                "name": "one_more_node",
                "parameters": {
                    "str_value": {
                        "default": "test",
                        "title": "Str Value",
                        "type": "string",
                        "is_targets": False,
                    },
                    "float_value": {
                        "default": 1.0,
                        "title": "Float Value",
                        "type": "number",
                        "is_targets": False,
                    },
                },
            },
            "test_cal": {
                "status": ElementRunStatus.pending,
                "id": "test_cal",
                "name": "test_cal",
                "parameters": {
                    "resonator": {
                        "default": "q1.resonator",
                        "title": "Resonator",
                        "type": "string",
                        "is_targets": False,
                    },
                    "sampling_points": {
                        "default": 100,
                        "title": "Sampling Points",
                        "type": "integer",
                        "is_targets": False,
                    },
                },
            },
        },
        "connectivity": [
            ("test_node", "one_more_node"),
            ("one_more_node", "test_cal"),
        ],
        "parameters": {
            "retries": {
                "default": 1,
                "is_targets": False,
                "title": "Retries",
                "type": "integer",
            },
            "qubits": {
                "is_targets": True,
                "items": {"type": "string"},
                "title": "Qubits",
                "type": "array",
            },
        },
    }
