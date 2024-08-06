from pathlib import Path
from typing import Generator

import pytest

from qualibrate.parameters import (
    GraphParameters,
)
from qualibrate.qualibration_graph import NodeState, QualibrationGraph
from qualibrate.qualibration_library import QualibrationLibrary


@pytest.fixture
def qualibration_lib() -> Generator[QualibrationLibrary, None, None]:
    cal_path = Path(__file__).parent / "calibrations"
    tmp = QualibrationLibrary(cal_path)
    yield tmp


@pytest.fixture
def graph_params() -> GraphParameters:
    class GP(GraphParameters):
        retries: int = 2

    return GP(retries=1)


def test_export(
    qualibration_lib: QualibrationLibrary, graph_params: GraphParameters
):
    g = QualibrationGraph(
        "name",
        graph_params.__class__,
        {"test_node": ["one_more_node"], "one_more_node": ["test_cal"]},
    )
    assert g.export(node_names_only=True) == {
        "directed": True,
        "multigraph": False,
        "graph": [],
        "nodes": [
            {"state": NodeState.pending, "retries": 0, "id": "test_node"},
            {"state": NodeState.pending, "retries": 0, "id": "one_more_node"},
            {"state": NodeState.pending, "retries": 0, "id": "test_cal"},
        ],
        "adjacency": [[{"id": "one_more_node"}], [{"id": "test_cal"}], []],
    }


def test_serialize(
    qualibration_lib: QualibrationLibrary, graph_params: GraphParameters
):
    g = QualibrationGraph(
        "name",
        graph_params.__class__,
        {"test_node": ["one_more_node"], "one_more_node": ["test_cal"]},
    )
    assert g.serialize() == {
        "name": "name",
        "multigraph": False,
        "directed": True,
        "graph": [],
        "nodes": {
            "test_node": {
                "state": NodeState.pending,
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
                },
            },
            "one_more_node": {
                "state": NodeState.pending,
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
                },
            },
            "test_cal": {
                "state": NodeState.pending,
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
                },
            },
        },
        "connectivity": {
            "test_node": [{"id": "one_more_node"}],
            "one_more_node": [{"id": "test_cal"}],
            "test_cal": [],
        },
        "parameters": {
            "retries": {
                "default": 2,
                "title": "Retries",
                "type": "integer",
            },
        },
    }


def test_cytoscape(
    qualibration_lib: QualibrationLibrary, graph_params: GraphParameters
):
    g = QualibrationGraph(
        "name",
        graph_params.__class__,
        {"test_node": ["one_more_node"], "one_more_node": ["test_cal"]},
    )
    print(g.cytoscape_representation())


def test_run_sequence(
    qualibration_lib: QualibrationLibrary, graph_params: GraphParameters
):
    g = QualibrationGraph(
        "graph_name",
        graph_params.__class__,
        {"test_node": ["one_more_node"], "one_more_node": ["test_cal"]},
    )
    g.run(graph_params)


def test_run_multi_pred(
    qualibration_lib: QualibrationLibrary, graph_params: GraphParameters
):
    g = QualibrationGraph(
        "graph_name",
        graph_params.__class__,
        {
            "test_node": ["test_cal", "one_more_node"],
            "one_more_node": ["test_cal"],
        },
    )
    g.run(
        g.full_parameters(
            **{
                "parameters": {"retries": 4},
                "nodes_parameters": {
                    "test_node": {
                        "str_value": "test_custom",
                        "int_value": 100,
                        "float_value": 0.2,
                    },
                    "one_more_node": {
                        "str_value": "test_custom_more",
                        "float_value": 0.4,
                    },
                    "test_cal": {
                        "resonator": "test_custom",
                        "sampling_points": 20,
                    },
                },
            }
        )
    )
