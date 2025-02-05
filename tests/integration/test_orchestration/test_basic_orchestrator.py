from collections.abc import Generator
from pathlib import Path

import pytest
from pydantic import Field

from qualibrate.models.execution_history import ExecutionHistoryItem
from qualibrate.models.node_status import NodeStatus
from qualibrate.models.outcome import Outcome
from qualibrate.models.run_summary.run_error import RunError
from qualibrate.orchestration.basic_orchestrator import BasicOrchestrator
from qualibrate.parameters import (
    GraphParameters,
)
from qualibrate.qualibration_graph import QualibrationGraph
from qualibrate.qualibration_library import QualibrationLibrary


@pytest.fixture
def qualibration_lib() -> Generator[QualibrationLibrary, None, None]:
    cal_path = Path(__file__).parent / "calibrations"
    yield QualibrationLibrary(cal_path)


@pytest.fixture
def graph_params() -> GraphParameters:
    class GP(GraphParameters):
        qubits: list[str] = Field(
            default_factory=lambda: ["q1", "q2", "q3", "q4"]
        )
        retries: int = 2

    return GP()


def test_run_sequence_no_error(
    qualibration_lib: QualibrationLibrary, graph_params: GraphParameters
):
    nodes = {
        k: v
        for k, v in qualibration_lib.nodes.items()
        if k in ("first_node", "second_node", "third_node")
    }

    g = QualibrationGraph(
        "graph_name",
        graph_params,
        nodes,
        [("first_node", "second_node"), ("second_node", "third_node")],
        orchestrator=BasicOrchestrator(),
    )
    g._orchestrator.traverse_graph(g, g.full_parameters.parameters.targets)
    execution_history = g._orchestrator._execution_history
    expected_outcomes = [
        {
            "q1": Outcome.SUCCESSFUL,
            "q2": Outcome.SUCCESSFUL,
            "q3": Outcome.SUCCESSFUL,
            "q4": Outcome.SUCCESSFUL,
        },
        {
            "q1": Outcome.FAILED,
            "q2": Outcome.SUCCESSFUL,
            "q3": Outcome.FAILED,
            "q4": Outcome.SUCCESSFUL,
        },
        {
            "q1": Outcome.SUCCESSFUL,
            "q4": Outcome.SUCCESSFUL,
            "q2": Outcome.SUCCESSFUL,
            "q3": Outcome.SUCCESSFUL,
        },
    ]
    assert execution_history == [
        ExecutionHistoryItem(
            name=item.name,
            status=NodeStatus.finished,
            run_start=item.run_start,
            run_end=item.run_end,
            parameters=item.parameters,
            outcomes=outcomes,
        )
        for item, outcomes in zip(execution_history, expected_outcomes)
    ]


def test_run_sequence_with_error(
    qualibration_lib: QualibrationLibrary, graph_params: GraphParameters
):
    nodes = {
        k: v
        for k, v in qualibration_lib.nodes.items()
        if k in ("first_node", "forth_node")
    }

    g = QualibrationGraph(
        "graph_name",
        graph_params,
        nodes,
        [("first_node", "forth_node")],
        orchestrator=BasicOrchestrator(),
    )
    with pytest.raises(ValueError, match="Execution error"):
        g._orchestrator.traverse_graph(g, g.full_parameters.parameters.targets)
    execution_history = g._orchestrator._execution_history
    assert execution_history[0] == ExecutionHistoryItem(
        name=execution_history[0].name,
        status=NodeStatus.finished,
        parameters=execution_history[0].parameters,
        run_start=execution_history[0].run_start,
        run_end=execution_history[0].run_end,
        outcomes={
            "q1": Outcome.SUCCESSFUL,
            "q2": Outcome.SUCCESSFUL,
            "q3": Outcome.SUCCESSFUL,
            "q4": Outcome.SUCCESSFUL,
        },
    )
    assert execution_history[1] == ExecutionHistoryItem(
        name="forth_node",
        description="Description.",
        status=NodeStatus.failed,
        parameters=execution_history[1].parameters,
        error=RunError(
            error_class="ValueError",
            message="Execution error",
            traceback=execution_history[1].error.traceback,
        ),
        outcomes={
            "q1": Outcome.SUCCESSFUL,
            "q2": Outcome.SUCCESSFUL,
            "q3": Outcome.SUCCESSFUL,
            "q4": Outcome.SUCCESSFUL,
        },
        run_start=execution_history[1].run_start,
        run_end=execution_history[1].run_end,
    )
