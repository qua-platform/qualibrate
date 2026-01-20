from collections.abc import Generator
from pathlib import Path
from unittest.mock import MagicMock

import pytest
from pydantic import Field

from qualibrate.core import QualibrationNode
from qualibrate.core.models.execution_history import (
    ExecutionHistoryItem,
    ItemData,
    ItemMetadata,
)
from qualibrate.core.models.node_status import ElementRunStatus
from qualibrate.core.models.operational_condition import OperationalCondition
from qualibrate.core.models.outcome import Outcome
from qualibrate.core.models.run_summary.node import NodeRunSummary
from qualibrate.core.models.run_summary.run_error import RunError
from qualibrate.core.orchestration.basic_orchestrator import BasicOrchestrator
from qualibrate.core.parameters import GraphParameters, RunnableParameters
from qualibrate.core.qualibration_graph import QualibrationGraph
from qualibrate.core.qualibration_library import QualibrationLibrary


@pytest.fixture
def qualibration_lib(
    qualibrate_config_and_path_mocked,
) -> Generator[QualibrationLibrary, None, None]:
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
            id=item.id,
            created_at=item.metadata.run_start,
            metadata=ItemMetadata(
                name=item.metadata.name,
                status=ElementRunStatus.finished,
                run_start=item.metadata.run_start,
                run_end=item.metadata.run_end,
                description=None,
            ),
            data=ItemData(
                parameters=item.data.parameters,
                outcomes=outcomes,
                error=None,
            ),
        )
        for item, outcomes in zip(
            execution_history, expected_outcomes, strict=False
        )
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
        id=execution_history[0].id,
        created_at=execution_history[0].metadata.run_start,
        metadata=ItemMetadata(
            name="first_node",
            description=None,
            status=ElementRunStatus.finished,
            run_start=execution_history[0].metadata.run_start,
            run_end=execution_history[0].metadata.run_end,
        ),
        data=ItemData(
            parameters=execution_history[0].data.parameters,
            outcomes={
                "q1": Outcome.SUCCESSFUL,
                "q2": Outcome.SUCCESSFUL,
                "q3": Outcome.SUCCESSFUL,
                "q4": Outcome.SUCCESSFUL,
            },
            error=None,
        ),
    )
    assert execution_history[1] == ExecutionHistoryItem(
        id=execution_history[1].id,
        created_at=execution_history[1].metadata.run_start,
        metadata=ItemMetadata(
            name="forth_node",
            description="Description.",
            status=ElementRunStatus.error,
            run_start=execution_history[1].metadata.run_start,
            run_end=execution_history[1].metadata.run_end,
        ),
        data=ItemData(
            parameters=execution_history[1].data.parameters,
            error=RunError(
                error_class="ValueError",
                message="Execution error",
                traceback=execution_history[1].data.error.traceback,
            ),
            outcomes={
                "q1": Outcome.SUCCESSFUL,
                "q2": Outcome.SUCCESSFUL,
                "q3": Outcome.SUCCESSFUL,
                "q4": Outcome.SUCCESSFUL,
            },
        ),
    )


def test_traverse_graph_with_conditional_failed_edge_filters_targets():
    """
    Integration test: Verify that operational conditions on failed edges
    filter targets correctly during graph traversal.

    Graph structure:
        node1 (root) - some targets fail with retriable errors
          ├─[SUCCESS]──────────> node2_success
          └─[FAILED w/ condition]> node3_retry (only retries retriable errors)

    Expected:
    - node1 runs with all targets (set by orchestrator)
    - Successful targets go to node2_success (set by orchestrator)
    - Failed targets are filtered by condition
     before going to node3_retry (set by orchestrator)
    """
    orchestrator = BasicOrchestrator(skip_failed=False)

    # Create mock nodes
    node1 = MagicMock(spec=QualibrationNode)
    node1.name = "node1"
    node1.parameters = MagicMock(spec=RunnableParameters)
    node1.outcomes = {}
    node1.description = None

    node2_success = MagicMock(spec=QualibrationNode)
    node2_success.name = "node2_success"
    node2_success.parameters = MagicMock(spec=RunnableParameters)
    node2_success.outcomes = {}
    node2_success.description = None

    node3_retry = MagicMock(spec=QualibrationNode)
    node3_retry.name = "node3_retry"
    node3_retry.parameters = MagicMock(spec=RunnableParameters)
    node3_retry.outcomes = {}
    node3_retry.description = None

    # node1 will track error types for filtering
    node1.results = {
        "q1": {"status": "success"},
        "q2": {"status": "failed", "error_type": "permanent"},
        "q3": {"status": "failed", "error_type": "retriable"},
        "q4": {"status": "failed", "error_type": "retriable"},
    }

    # Create mock graph
    mock_graph = MagicMock(spec=QualibrationGraph)
    mock_graph.name = "test_graph_with_conditional_retry"
    mock_graph._loop_conditions = {}

    # Setup parameters
    mock_params = MagicMock()
    node1_params = MagicMock()
    node1_params.targets = None
    node1_params.model_dump.return_value = {}
    node2_params = MagicMock()
    node2_params.targets = None
    node2_params.model_dump.return_value = {}
    node3_params = MagicMock()
    node3_params.targets = None
    node3_params.model_dump.return_value = {}

    mock_params.node1 = node1_params
    mock_params.node2_success = node2_params
    mock_params.node3_retry = node3_params
    mock_graph.full_parameters.nodes = mock_params

    # Create NetworkX graph
    import networkx as nx

    nx_graph = nx.DiGraph()

    nx_graph.add_node(node1, status=ElementRunStatus.pending, retries=0)
    nx_graph.add_node(node2_success, status=ElementRunStatus.pending, retries=0)
    nx_graph.add_node(node3_retry, status=ElementRunStatus.pending, retries=0)

    # Operational condition: only retry if error_type is "retriable"
    retry_condition = OperationalCondition(
        on_function=lambda node, target: node.results[target]["error_type"]
        == "retriable"
    )

    # Add edges
    nx_graph.add_edge(
        node1,
        node2_success,
        scenario=Outcome.SUCCESSFUL,
        operational_condition=OperationalCondition(),
    )
    nx_graph.add_edge(
        node1,
        node3_retry,
        scenario=Outcome.FAILED,
        operational_condition=retry_condition,
    )

    mock_graph._graph = nx_graph

    # Track execution
    execution_log = []

    def node1_run(interactive=False, **kwargs):
        targets_received = node1_params.targets[:]
        execution_log.append(("node1", targets_received))

        # Create run summary
        summary = MagicMock(spec=NodeRunSummary)
        summary.successful_targets = ["q1"]
        summary.failed_targets = ["q2", "q3", "q4"]
        summary.initial_targets = targets_received

        # Set run_summary on the node (orchestrator will read this)
        node1.run_summary = summary
        return summary

    def node2_run(interactive=False, **kwargs):
        targets_received = node2_params.targets[:]
        execution_log.append(("node2_success", targets_received))

        # Create run summary
        summary = MagicMock(spec=NodeRunSummary)
        summary.successful_targets = targets_received
        summary.failed_targets = []
        summary.initial_targets = targets_received

        # Set run_summary on the node
        node2_success.run_summary = summary
        return summary

    def node3_run(interactive=False, **kwargs):
        targets_received = node3_params.targets[:]
        execution_log.append(("node3_retry", targets_received))

        # Create run summary
        summary = MagicMock(spec=NodeRunSummary)
        summary.successful_targets = targets_received
        summary.failed_targets = []
        summary.initial_targets = targets_received

        # Set run_summary on the node
        node3_retry.run_summary = summary
        return summary

    node1.run = node1_run
    node2_success.run = node2_run
    node3_retry.run = node3_run

    # Run traversal
    orchestrator.traverse_graph(mock_graph, ["q1", "q2", "q3", "q4"])

    # Verify execution
    assert len(execution_log) == 3

    # node1 receives all targets
    assert execution_log[0][0] == "node1"
    assert set(execution_log[0][1]) == {"q1", "q2", "q3", "q4"}

    # node2_success receives only successful targets
    assert execution_log[1][0] == "node2_success"
    assert set(execution_log[1][1]) == {"q1"}

    # node3_retry receives only retriable failed targets (q3, q4)
    # NOT q2 (permanent error) - filtered by operational condition
    assert execution_log[2][0] == "node3_retry"
    assert set(execution_log[2][1]) == {"q3", "q4"}

    # Verify all nodes finished
    assert (
        nx_graph.nodes[node1][QualibrationGraph.ELEMENT_STATUS_FIELD]
        == ElementRunStatus.finished
    )
    assert (
        nx_graph.nodes[node2_success][QualibrationGraph.ELEMENT_STATUS_FIELD]
        == ElementRunStatus.finished
    )
    assert (
        nx_graph.nodes[node3_retry][QualibrationGraph.ELEMENT_STATUS_FIELD]
        == ElementRunStatus.finished
    )


def test_traverse_graph_with_generator_condition_on_failed_edge():
    """
    Integration test: Verify generator-based operational conditions work
    during graph traversal.

    Graph structure:
        node1 (root) - targets fail with different retry counts
          ├─[SUCCESS]──────────────> node2_success
          └─[FAILED w/ generator]──> node3_retry (only if retries < max)
    """
    orchestrator = BasicOrchestrator(skip_failed=False)

    # Create mock nodes
    node1 = MagicMock(spec=QualibrationNode)
    node1.name = "node1"
    node1.max_retries = 3
    node1.parameters = MagicMock(spec=RunnableParameters)
    node1.outcomes = {}
    node1.description = None

    node2_success = MagicMock(spec=QualibrationNode)
    node2_success.name = "node2_success"
    node2_success.parameters = MagicMock(spec=RunnableParameters)
    node2_success.outcomes = {}
    node2_success.description = None

    node3_retry = MagicMock(spec=QualibrationNode)
    node3_retry.name = "node3_retry"
    node3_retry.parameters = MagicMock(spec=RunnableParameters)
    node3_retry.outcomes = {}
    node3_retry.description = None

    # node1: mixed results with retry counts
    node1.results = {
        "q1": {"status": "success", "retries": 0},
        "q2": {"status": "failed", "retries": 2},  # Can retry
        "q3": {"status": "failed", "retries": 3},  # Max retries reached
        "q4": {"status": "failed", "retries": 1},  # Can retry
    }

    # Create mock graph
    mock_graph = MagicMock(spec=QualibrationGraph)
    mock_graph.name = "test_graph_with_generator_condition"
    mock_graph._loop_conditions = {}

    # Setup parameters
    mock_params = MagicMock()
    node1_params = MagicMock()
    node1_params.targets = None
    node1_params.model_dump.return_value = {}
    node2_params = MagicMock()
    node2_params.targets = None
    node2_params.model_dump.return_value = {}
    node3_params = MagicMock()
    node3_params.targets = None
    node3_params.model_dump.return_value = {}

    mock_params.node1 = node1_params
    mock_params.node2_success = node2_params
    mock_params.node3_retry = node3_params
    mock_graph.full_parameters.nodes = mock_params

    # Create NetworkX graph
    import networkx as nx

    nx_graph = nx.DiGraph()

    nx_graph.add_node(node1, status=ElementRunStatus.pending, retries=0)
    nx_graph.add_node(node2_success, status=ElementRunStatus.pending, retries=0)
    nx_graph.add_node(node3_retry, status=ElementRunStatus.pending, retries=0)

    # Generator condition: only retry if retries < max_retries
    def retry_if_not_exhausted():
        while True:
            element, target = yield
            yield element.results[target]["retries"] < element.max_retries

    retry_condition = OperationalCondition(on_generator=retry_if_not_exhausted)

    # Add edges
    nx_graph.add_edge(
        node1,
        node2_success,
        scenario=Outcome.SUCCESSFUL,
        operational_condition=OperationalCondition(),
    )
    nx_graph.add_edge(
        node1,
        node3_retry,
        scenario=Outcome.FAILED,
        operational_condition=retry_condition,
    )

    mock_graph._graph = nx_graph

    # Track execution
    execution_log = []

    def node1_run(interactive=False, **kwargs):
        targets_received = node1_params.targets[:]
        execution_log.append(("node1", targets_received))

        # Create run summary
        summary = MagicMock(spec=NodeRunSummary)
        summary.successful_targets = ["q1"]
        summary.failed_targets = ["q2", "q3", "q4"]
        summary.initial_targets = targets_received

        # Set run_summary on the node
        node1.run_summary = summary
        return summary

    def node2_run(interactive=False, **kwargs):
        targets_received = node2_params.targets[:]
        execution_log.append(("node2_success", targets_received))

        # Create run summary
        summary = MagicMock(spec=NodeRunSummary)
        summary.successful_targets = targets_received
        summary.failed_targets = []
        summary.initial_targets = targets_received

        # Set run_summary on the node
        node2_success.run_summary = summary
        return summary

    def node3_run(interactive=False, **kwargs):
        targets_received = node3_params.targets[:]
        execution_log.append(("node3_retry", targets_received))

        # Create run summary
        summary = MagicMock(spec=NodeRunSummary)
        summary.successful_targets = targets_received
        summary.failed_targets = []
        summary.initial_targets = targets_received

        # Set run_summary on the node
        node3_retry.run_summary = summary
        return summary

    node1.run = node1_run
    node2_success.run = node2_run
    node3_retry.run = node3_run

    # Run traversal
    orchestrator.traverse_graph(mock_graph, ["q1", "q2", "q3", "q4"])

    # Verify execution
    assert len(execution_log) == 3

    # node1 receives all targets
    assert execution_log[0][0] == "node1"
    assert set(execution_log[0][1]) == {"q1", "q2", "q3", "q4"}

    # node2_success receives successful targets
    assert execution_log[1][0] == "node2_success"
    assert set(execution_log[1][1]) == {"q1"}

    # node3_retry receives only targets with retries < max (q2, q4)
    # NOT q3 (retries=3, max=3)
    assert execution_log[2][0] == "node3_retry"
    assert set(execution_log[2][1]) == {"q2", "q4"}

    # Verify all nodes finished
    assert (
        nx_graph.nodes[node1][QualibrationGraph.ELEMENT_STATUS_FIELD]
        == ElementRunStatus.finished
    )
    assert (
        nx_graph.nodes[node2_success][QualibrationGraph.ELEMENT_STATUS_FIELD]
        == ElementRunStatus.finished
    )
    assert (
        nx_graph.nodes[node3_retry][QualibrationGraph.ELEMENT_STATUS_FIELD]
        == ElementRunStatus.finished
    )


def test_traverse_graph_multiple_failed_edges_different_conditions():
    """
    Integration test: Multiple failed edges with different conditions route
    targets to different handlers.

    Graph structure:
        node1 (root) - targets fail with different error types
          ├─[SUCCESS]─────────────────> node2_success
          ├─[FAILED w/ timeout cond]──> node3_timeout_handler
          └─[FAILED w/ hw cond]───────> node4_hw_handler
    """
    from qualibrate.core.models.operational_condition import OperationalCondition

    orchestrator = BasicOrchestrator(skip_failed=False)

    # Create mock nodes
    node1 = MagicMock(spec=QualibrationNode)
    node1.name = "node1"
    node1.snapshot_idx = None
    node1.parameters = MagicMock(spec=RunnableParameters)
    node1.outcomes = {}
    node1.description = None

    node2_success = MagicMock(spec=QualibrationNode)
    node2_success.name = "node2_success"
    node2_success.snapshot_idx = None
    node2_success.parameters = MagicMock(spec=RunnableParameters)
    node2_success.outcomes = {}
    node2_success.description = None

    node3_timeout = MagicMock(spec=QualibrationNode)
    node3_timeout.name = "node3_timeout_handler"
    node3_timeout.snapshot_idx = None
    node3_timeout.parameters = MagicMock(spec=RunnableParameters)
    node3_timeout.outcomes = {}
    node3_timeout.description = None

    node4_hw = MagicMock(spec=QualibrationNode)
    node4_hw.name = "node4_hw_handler"
    node4_hw.snapshot_idx = None
    node4_hw.parameters = MagicMock(spec=RunnableParameters)
    node4_hw.outcomes = {}
    node4_hw.description = None

    # node1: different error types
    node1.results = {
        "q1": {"status": "success"},
        "q2": {"status": "failed", "error": "timeout"},
        "q3": {"status": "failed", "error": "hardware"},
        "q4": {"status": "failed", "error": "timeout"},
        "q5": {"status": "failed", "error": "hardware"},
    }

    # Create mock graph
    mock_graph = MagicMock(spec=QualibrationGraph)
    mock_graph.name = "test_graph_multiple_error_handlers"
    mock_graph._loop_conditions = {}

    # Setup parameters
    mock_params = MagicMock()
    for name in [
        "node1",
        "node2_success",
        "node3_timeout_handler",
        "node4_hw_handler",
    ]:
        params = MagicMock()
        params.targets = None
        params.model_dump.return_value = {}
        setattr(mock_params, name, params)

    mock_graph.full_parameters.nodes = mock_params

    # Create NetworkX graph
    import networkx as nx

    nx_graph = nx.DiGraph()

    for node in [node1, node2_success, node3_timeout, node4_hw]:
        nx_graph.add_node(node, status=ElementRunStatus.pending, retries=0)

    # Conditions for different error types
    timeout_condition = OperationalCondition(
        on_function=lambda n, t: n.results[t]["error"] == "timeout"
    )
    hw_condition = OperationalCondition(
        on_function=lambda n, t: n.results[t]["error"] == "hardware"
    )

    # Add edges
    nx_graph.add_edge(
        node1,
        node2_success,
        scenario=Outcome.SUCCESSFUL,
        operational_condition=OperationalCondition(),
    )
    nx_graph.add_edge(
        node1,
        node3_timeout,
        scenario=Outcome.FAILED,
        operational_condition=timeout_condition,
    )
    nx_graph.add_edge(
        node1,
        node4_hw,
        scenario=Outcome.FAILED,
        operational_condition=hw_condition,
    )

    mock_graph._graph = nx_graph

    # Track execution
    execution_log = {}

    def node1_run(interactive=False, **kwargs):
        params = mock_params.node1
        targets_received = params.targets[:]
        execution_log["node1"] = targets_received

        # Create run summary
        summary = MagicMock(spec=NodeRunSummary)
        summary.successful_targets = ["q1"]
        summary.failed_targets = ["q2", "q3", "q4", "q5"]
        summary.initial_targets = targets_received

        # Set run_summary on the node
        node1.run_summary = summary
        return summary

    def node2_run(interactive=False, **kwargs):
        params = mock_params.node2_success
        targets_received = params.targets[:]
        execution_log["node2_success"] = targets_received

        # Create run summary
        summary = MagicMock(spec=NodeRunSummary)
        summary.successful_targets = targets_received
        summary.failed_targets = []
        summary.initial_targets = targets_received

        # Set run_summary on the node
        node2_success.run_summary = summary
        return summary

    def node3_run(interactive=False, **kwargs):
        params = mock_params.node3_timeout_handler
        targets_received = params.targets[:]
        execution_log["node3_timeout_handler"] = targets_received

        # Create run summary
        summary = MagicMock(spec=NodeRunSummary)
        summary.successful_targets = targets_received
        summary.failed_targets = []
        summary.initial_targets = targets_received

        # Set run_summary on the node
        node3_timeout.run_summary = summary
        return summary

    def node4_run(interactive=False, **kwargs):
        params = mock_params.node4_hw_handler
        targets_received = params.targets[:]
        execution_log["node4_hw_handler"] = targets_received

        # Create run summary
        summary = MagicMock(spec=NodeRunSummary)
        summary.successful_targets = targets_received
        summary.failed_targets = []
        summary.initial_targets = targets_received

        # Set run_summary on the node
        node4_hw.run_summary = summary
        return summary

    node1.run = node1_run
    node2_success.run = node2_run
    node3_timeout.run = node3_run
    node4_hw.run = node4_run

    # Run traversal
    orchestrator.traverse_graph(mock_graph, ["q1", "q2", "q3", "q4", "q5"])

    # Verify routing
    assert set(execution_log["node1"]) == {"q1", "q2", "q3", "q4", "q5"}
    assert set(execution_log["node2_success"]) == {"q1"}
    assert set(execution_log["node3_timeout_handler"]) == {"q2", "q4"}
    assert set(execution_log["node4_hw_handler"]) == {"q3", "q5"}

    # Verify all nodes finished
    for node in [node1, node2_success, node3_timeout, node4_hw]:
        assert (
            nx_graph.nodes[node][QualibrationGraph.ELEMENT_STATUS_FIELD]
            == ElementRunStatus.finished
        )
