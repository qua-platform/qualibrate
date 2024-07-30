from pathlib import Path
from typing import Generator

import pytest

from qualibrate.parameters import (
    CommonGraphParameters,
    GraphParameters,
    NodeParameters,
)
from qualibrate.qualibration_graph import NodeState, QualibrationGraph
from qualibrate.qualibration_library import QualibrationLibrary


@pytest.fixture
def qualibration_lib() -> Generator[QualibrationLibrary, None, None]:
    cal_path = Path(__file__).parents[2] / "calibrations"
    tmp = QualibrationLibrary(cal_path)
    yield tmp


@pytest.fixture
def graph_params() -> GraphParameters:
    class TestNodeParameters(NodeParameters):
        str_value: str = "test"
        int_value: int = 1
        float_value: float = 1.0

    class OneMoreModeParameters(NodeParameters):
        str_value: str = "test"
        float_value: float = 1.0

    class TestCalParameters(NodeParameters):
        resonator: str = "q1.resonator"
        sampling_points: int = 100

    class LocalGraphParameter(GraphParameters):
        pass

    return LocalGraphParameter(
        graph_parameters=CommonGraphParameters(),
        nodes_parameters={
            "test_node": TestNodeParameters(),
            "one_more_node": OneMoreModeParameters(),
            "test_cal": TestCalParameters(),
        },
    )


def test_export(
    qualibration_lib: QualibrationLibrary, graph_params: GraphParameters
):
    g = QualibrationGraph(
        "name",
        graph_params.__class__,
        {"test_node": ["one_more_node"], "one_more_node": ["test_cal"]},
    )
    exported = g.export(node_names_only=True)
    assert exported == {
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
    g.run(graph_params)
