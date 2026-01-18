from collections.abc import Generator, Sequence
from pathlib import Path
from typing import Any

import pytest
from pydantic import Field

from qualibrate.orchestration.qualibration_orchestrator import (
    QualibrationOrchestrator,
)
from qualibrate.parameters import (
    GraphParameters,
)
from qualibrate.qualibration_graph import QualibrationGraph
from qualibrate.qualibration_library import QualibrationLibrary


@pytest.fixture
def qualibration_lib(
    mocker,
    qualibrate_config_from_path,
) -> Generator[QualibrationLibrary, None, None]:
    mocker.patch("qualibrate.qualibration_node.get_qualibrate_config_path")
    mocker.patch(
        "qualibrate.qualibration_node.get_qualibrate_config",
        return_value=qualibrate_config_from_path,
    )
    cal_path = Path(__file__).parent / "simple_calibrations"
    tmp = QualibrationLibrary(cal_path)
    yield tmp


@pytest.fixture
def graph_params() -> GraphParameters:
    class GP(GraphParameters):
        qubits: list[str] = Field(default_factory=list)
        retries: int = 2

    return GP(retries=1)


class Orchestrator(QualibrationOrchestrator):
    def traverse_graph(
        self, graph: QualibrationGraph, targets: Sequence[Any]
    ) -> None:
        pass


def test_run_sequence(
    qualibration_lib: QualibrationLibrary, graph_params: GraphParameters
):
    g = QualibrationGraph(
        "graph_name",
        graph_params,
        dict(qualibration_lib.nodes.items()),
        [("test_node", "one_more_node"), ("one_more_node", "test_cal")],
        orchestrator=Orchestrator(),
    )
    g.run(
        **graph_params.model_dump(),
        nodes={
            "test_node": {},
            "one_more_node": {},
            "test_cal": {},
        },
    )


def test_run_multi_predecessors(
    qualibration_lib: QualibrationLibrary, graph_params: GraphParameters
):
    g = QualibrationGraph(
        "graph_name",
        graph_params,
        dict(qualibration_lib.nodes.items()),
        [
            ("test_node", "test_cal"),
            ("test_node", "one_more_node"),
            ("one_more_node", "test_cal"),
        ],
        orchestrator=Orchestrator(),
    )
    g.run(
        retries=4,
        nodes={
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
    )


def test_run_multi_nodes_instances(
    qualibration_lib: QualibrationLibrary, graph_params: GraphParameters
):
    test_node_1 = qualibration_lib.nodes["test_node"]
    one_more_node = qualibration_lib.nodes["one_more_node"]
    test_cal = qualibration_lib.nodes["test_cal"]
    test_node_2 = test_node_1.copy("test_node_2")
    one_more_node_2 = one_more_node.copy("one_more_node_2")
    nodes = [test_node_1, test_node_2, one_more_node, one_more_node_2, test_cal]
    g = QualibrationGraph(
        "graph_name",
        graph_params,
        {n.name: n for n in nodes},
        [
            ("test_node", "test_cal"),
            # --
            ("test_node", "test_node_2"),
            ("test_node_2", "one_more_node_2"),
            # ---
            ("test_node", "one_more_node"),
            ("one_more_node", "test_cal"),
            # ---
            ("test_node", "one_more_node_2"),
            ("one_more_node_2", "test_cal"),
        ],
        orchestrator=Orchestrator(),
    )
    g.run(
        retries=4,
        nodes={
            "test_node": {
                "str_value": "test_custom",
                "int_value": 100,
                "float_value": 0.2,
            },
            "test_node_2": {
                "str_value": "test_custom-2",
                "int_value": 200,
                "float_value": 0.4,
            },
            "one_more_node": {
                "str_value": "test_custom_more",
                "float_value": 0.4,
            },
            "one_more_node_2": {
                "str_value": "test_custom_more-2",
                "float_value": 0.8,
            },
            "test_cal": {
                "resonator": "test_custom",
                "sampling_points": 20,
            },
        },
    )
