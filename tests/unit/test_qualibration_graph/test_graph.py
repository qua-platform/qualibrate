from pathlib import Path
from typing import Any, Generator, Sequence

import pytest

from qualibrate.orchestration.qualibration_orchestrator import (
    QualibrationOrchestrator,
)
from qualibrate.parameters import (
    GraphParameters,
)
from qualibrate.qualibration_graph import NodeStatus, QualibrationGraph
from qualibrate.qualibration_library import QualibrationLibrary


@pytest.fixture
def qualibration_lib() -> Generator[QualibrationLibrary, None, None]:
    cal_path = Path(__file__).parent / "calibrations"
    tmp = QualibrationLibrary(cal_path)
    yield tmp


@pytest.fixture
def graph_params() -> GraphParameters:
    class GP(GraphParameters):
        qubits: list[str] = []
        retries: int = 2

    return GP(retries=1)


class Orchestrator(QualibrationOrchestrator):
    def traverse_graph(
        self, graph: QualibrationGraph, targets: Sequence[Any]
    ) -> None:
        pass


def test_export(
    qualibration_lib: QualibrationLibrary, graph_params: GraphParameters
):
    g = QualibrationGraph(
        "name",
        graph_params,
        qualibration_lib.nodes,
        [("test_node", "one_more_node"), ("one_more_node", "test_cal")],
    )
    assert g.nx_graph_export(node_names_only=True) == {
        "nodes": [
            {"status": NodeStatus.pending, "retries": 0, "id": "test_node"},
            {"status": NodeStatus.pending, "retries": 0, "id": "one_more_node"},
            {"status": NodeStatus.pending, "retries": 0, "id": "test_cal"},
        ],
        # this is standard name so kept as is (not changed to
        "adjacency": [[{"id": "one_more_node"}], [{"id": "test_cal"}], []],
    }


def test_serialize(
    qualibration_lib: QualibrationLibrary, graph_params: GraphParameters
):
    g = QualibrationGraph(
        "name",
        graph_params,
        qualibration_lib.nodes,
        [("test_node", "one_more_node"), ("one_more_node", "test_cal")],
        orchestrator=Orchestrator(),
        description="some description",
    )
    assert g.serialize() == {
        "name": "name",
        "description": "some description",
        "orchestrator": {
            "__class__": (
                "tests.unit.test_qualibration_graph.test_graph.Orchestrator"
            ),
            "parameters": {},
        },
        "nodes": {
            "test_node": {
                "status": NodeStatus.pending,
                "retries": 0,
                "id": "test_node",
                "name": "test_node",
                "parameters": {
                    "str_value": {
                        "default": "test",
                        "title": "Str Value",
                        "type": "string",
                    },
                    "int_value": {
                        "default": 1,
                        "title": "Int Value",
                        "type": "integer",
                    },
                    "float_value": {
                        "default": 1.0,
                        "title": "Float Value",
                        "type": "number",
                    },
                    "qubits": {
                        "default": [],
                        "items": {"type": "string"},
                        "title": "Qubits",
                        "type": "array",
                    },
                },
            },
            "one_more_node": {
                "status": NodeStatus.pending,
                "retries": 0,
                "id": "one_more_node",
                "name": "one_more_node",
                "parameters": {
                    "str_value": {
                        "default": "test",
                        "title": "Str Value",
                        "type": "string",
                    },
                    "float_value": {
                        "default": 1.0,
                        "title": "Float Value",
                        "type": "number",
                    },
                    "qubits": {
                        "default": [],
                        "items": {"type": "string"},
                        "title": "Qubits",
                        "type": "array",
                    },
                },
            },
            "test_cal": {
                "status": NodeStatus.pending,
                "retries": 0,
                "id": "test_cal",
                "name": "test_cal",
                "parameters": {
                    "resonator": {
                        "default": "q1.resonator",
                        "title": "Resonator",
                        "type": "string",
                    },
                    "sampling_points": {
                        "default": 100,
                        "title": "Sampling Points",
                        "type": "integer",
                    },
                    "qubits": {
                        "default": [],
                        "items": {"type": "string"},
                        "title": "Qubits",
                        "type": "array",
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
                "title": "Retries",
                "type": "integer",
            },
            "qubits": {
                "default": [],
                "items": {"type": "string"},
                "title": "Qubits",
                "type": "array",
            },
        },
    }


def test_cytoscape(
    qualibration_lib: QualibrationLibrary, graph_params: GraphParameters
):
    g = QualibrationGraph(
        "name",
        graph_params,
        qualibration_lib.nodes,
        [("test_node", "one_more_node"), ("one_more_node", "test_cal")],
        orchestrator=Orchestrator(),
    )

    assert g.cytoscape_representation(g.serialize()) == [
        {
            "group": "nodes",
            "data": {"id": "test_node"},
            "position": {"x": 100, "y": 100},
        },
        {
            "group": "nodes",
            "data": {"id": "one_more_node"},
            "position": {"x": 100, "y": 100},
        },
        {
            "group": "nodes",
            "data": {"id": "test_cal"},
            "position": {"x": 100, "y": 100},
        },
        {
            "group": "edges",
            "data": {
                "id": "test_node_one_more_node",
                "source": "test_node",
                "target": "one_more_node",
            },
        },
        {
            "group": "edges",
            "data": {
                "id": "one_more_node_test_cal",
                "source": "one_more_node",
                "target": "test_cal",
            },
        },
    ]
