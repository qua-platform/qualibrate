from collections.abc import Generator
from pathlib import Path

import pytest
from pydantic import Field

from qualibrate import GraphParameters, QualibrationGraph, QualibrationLibrary
from qualibrate.models.outcome import Outcome
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
    exec_history = g._orchestrator.get_execution_history()
    assert len(exec_history.items) == 3
    assert [item.id for item in exec_history.items] == [None, None, 1]
    assert [h.elements_history is not None for h in exec_history.items] == [
        True,
        True,
        False,
    ], "Execution history isn't defined for graphs"


def test_context_manager_creation(qualibration_lib: QualibrationLibrary):
    class Parameters(GraphParameters):
        qubits: list[str] = Field(default_factory=list)

    with QualibrationGraph.build(
        "external_g",
        parameters=Parameters(),
        orchestrator=BasicOrchestrator(skip_failed=True),
    ) as external_g:
        with QualibrationGraph.build(
            "internal_g1",
            parameters=Parameters(),
            orchestrator=BasicOrchestrator(skip_failed=True),
        ) as internal_g1:
            n1 = qualibration_lib.nodes.get_nocopy("wf_node1").copy(name="n1")
            n2 = qualibration_lib.nodes.get_nocopy("wf_node1").copy(name="n2")
            internal_g1.add_node(n1)
            internal_g1.add_node(n2)
            internal_g1.connect(n1, n2)

        with QualibrationGraph.build(
            "internal_g2",
            parameters=Parameters(),
            orchestrator=BasicOrchestrator(skip_failed=True),
        ) as internal_g2:
            n1 = qualibration_lib.nodes.get_nocopy("wf_node2").copy(name="n1")
            n2 = qualibration_lib.nodes.get_nocopy("wf_node2").copy(name="n2")
            internal_g2.add_node(n1)
            internal_g2.add_node(n2)
            internal_g2.connect(n1, n2)

        external_g.add_nodes(internal_g1, internal_g2)
        external_g.connect(internal_g1, internal_g2)

    assert len(external_g._elements) == 2
    assert len(external_g._graph.nodes) == 2
    assert len(external_g._graph.edges) == 1
    for name in ("internal_g1", "internal_g2"):
        el = external_g._elements[name]
        assert len(el._graph.nodes) == 2, f"Invalid count of vertexes in {name}"
        assert len(el._graph.edges) == 1, f"Invalid count of edges in {name}"

    run_results = external_g.run(qubits=["s_s", "s_f", "f_s", "f_f"])
    assert run_results.successful_targets == ["s_s"]
    assert sorted(run_results.failed_targets) == sorted(["s_f", "f_s", "f_f"])
    exec_history = external_g._orchestrator.get_execution_history()
    hi = exec_history.items
    assert len(hi) == 2
    assert all(
        i.elements_history is not None and len(i.elements_history.items) == 2
        for i in hi
    )
    s_ends = {"s_s": Outcome.SUCCESSFUL, "f_s": Outcome.SUCCESSFUL}
    int_g0_h = hi[0].elements_history.items
    int_g1_h = hi[1].elements_history.items
    assert int_g0_h[0].data.outcomes == {
        "s_f": Outcome.FAILED,
        "f_f": Outcome.FAILED,
        **s_ends,
    }
    assert int_g0_h[1].data.outcomes == s_ends
    assert int_g1_h[0].data.outcomes == {
        "f_s": Outcome.FAILED,
        "s_s": Outcome.SUCCESSFUL,
    }
    assert int_g1_h[1].data.outcomes == {"s_s": Outcome.SUCCESSFUL}
