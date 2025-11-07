from collections.abc import Generator
from pathlib import Path

import pytest
from pydantic import Field

from qualibrate import GraphParameters, QualibrationGraph, QualibrationLibrary
from qualibrate.orchestration.basic_orchestrator import BasicOrchestrator


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
    cal_path = Path(__file__).parent / "nested_graph"
    lib = QualibrationLibrary(cal_path)
    yield lib


def test_run_sequence(qualibration_lib: QualibrationLibrary):
    class Parameters(GraphParameters):
        qubits: list[str] = Field(default_factory=list)

    nodes = {
        "wf1": qualibration_lib.graphs["wf1"],
        "wf2": qualibration_lib.graphs["wf1"].copy(name="wf2"),
        "wf_node1": qualibration_lib.nodes["wf_node1"],
    }
    g = QualibrationGraph(
        "graph_name",
        Parameters(),
        nodes,
        [("wf1", "wf2"), ("wf2", "wf_node1")],
        orchestrator=BasicOrchestrator(skip_failed=True),
    )
    run_results = g.run(qubits=["s_s", "s_f", "f_s", "f_f"])

    assert run_results.successful_targets == ["s_s"]
    assert sorted(run_results.failed_targets) == sorted(["s_f", "f_s", "f_f"])
    exec_history = g._orchestrator_or_error().get_execution_history()
    assert len(exec_history.items) == 3
    assert [item.id for item in exec_history.items] == [None, None, 1]
    assert [h.elements_history is not None for h in exec_history.items] == [
        True,
        True,
        False,
    ], "Execution history isn't defined for graphs"
