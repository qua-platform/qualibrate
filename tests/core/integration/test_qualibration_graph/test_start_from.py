from collections.abc import Generator
from pathlib import Path

import pytest
from pydantic import Field

from qualibrate.core import GraphParameters, QualibrationGraph, QualibrationLibrary
from qualibrate.core.orchestration.basic_orchestrator import BasicOrchestrator


@pytest.fixture
def qualibration_lib(
    mocker,
    qualibrate_config_from_path,
) -> Generator[QualibrationLibrary, None, None]:
    mocker.patch("qualibrate.core.qualibration_node.get_qualibrate_config_path")
    mocker.patch(
        "qualibrate.core.qualibration_node.get_qualibrate_config",
        return_value=qualibrate_config_from_path,
    )
    cal_path = Path(__file__).parent / "nested_graph"
    lib = QualibrationLibrary(cal_path)
    yield lib


@pytest.mark.parametrize(
    "start_node, hist_len, run_node_names",
    [
        ("n1", 4, ["n1", "n2", "n3", "n4"]),
        ("n2", 3, ["n2", "n3", "n4"]),
        ("n3", 2, ["n3", "n4"]),
        ("n4", 1, ["n4"]),
    ],
)
def test_run_sequence_start_from(
    qualibration_lib: QualibrationLibrary,
    start_node: str,
    hist_len: int,
    run_node_names: list[str],
):
    class Parameters(GraphParameters):
        qubits: list[str] = Field(default_factory=list)

    nodes = {
        "n1": qualibration_lib.nodes.get_nocopy("wf_node1").copy(name="n1"),
        "n2": qualibration_lib.nodes.get_nocopy("wf_node1").copy(name="n2"),
        "n3": qualibration_lib.nodes.get_nocopy("wf_node2").copy(name="n3"),
        "n4": qualibration_lib.nodes.get_nocopy("wf_node2").copy(name="n4"),
    }
    g = QualibrationGraph(
        "graph_name",
        Parameters(),
        nodes,
        [("n1", "n2"), ("n2", "n3"), ("n3", "n4")],
        orchestrator=BasicOrchestrator(skip_failed=True),
    )
    g.run(qubits=["s_s"], start_from=start_node)
    exec_history = g._orchestrator.get_execution_history()
    assert len(exec_history.items) == hist_len
    hist_node_names = {item.metadata.name for item in exec_history.items}
    all_names = set(nodes.keys())
    skipped_names = all_names.difference(hist_node_names)
    expected_skipped = all_names.difference(run_node_names)
    assert skipped_names == expected_skipped
    assert list(sorted(hist_node_names)) == run_node_names


def test_run_diamond_start_from(
    qualibration_lib: QualibrationLibrary,
):
    class Parameters(GraphParameters):
        qubits: list[str] = Field(default_factory=list)

    nodes = {
        "n1": qualibration_lib.nodes.get_nocopy("wf_node1").copy(name="n1"),
        "n2": qualibration_lib.nodes.get_nocopy("wf_node1").copy(name="n2"),
        "n3": qualibration_lib.nodes.get_nocopy("wf_node2").copy(name="n3"),
        "n4": qualibration_lib.nodes.get_nocopy("wf_node2").copy(name="n4"),
    }
    g = QualibrationGraph(
        "graph_name",
        Parameters(),
        nodes,
        [("n1", "n2"), ("n1", "n3"), ("n2", "n4"), ("n3", "n4")],
        orchestrator=BasicOrchestrator(skip_failed=True),
    )
    g.run(qubits=["s_s", "f_s", "s_f", "f_f"], start_from="n2")
    exec_history = g._orchestrator.get_execution_history()
    assert len(exec_history.items) == 2
    assert [item.metadata.name for item in exec_history.items] == ["n2", "n4"]
    assert set(exec_history.items[0].data.parameters.targets) == {
        "s_s",
        "f_s",
        "s_f",
        "f_f",
    }
    assert set(exec_history.items[1].data.parameters.targets) == {"s_s", "f_s"}
