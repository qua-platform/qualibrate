from queue import Queue
from unittest.mock import MagicMock, PropertyMock

import pytest

from qualibrate import QualibrationNode
from qualibrate.models.node_status import ElementRunStatus
from qualibrate.models.outcome import Outcome
from qualibrate.models.run_summary.node import NodeRunSummary
from qualibrate.orchestration.basic_orchestrator import BasicOrchestrator
from qualibrate.parameters import RunnableParameters
from qualibrate.qualibration_graph import QualibrationGraph


class TestBasicOrchestrator:
    def test_is_execution_finished_graph_is_none(self):
        orchestrator = BasicOrchestrator()
        orchestrator._graph = None  # Simulate no graph being set
        assert orchestrator._is_execution_finished() is True

    def test_is_execution_finished_empty_queue(self, mocker):
        orchestrator = BasicOrchestrator()

        # Mock _graph and queue size
        mocker.patch.object(orchestrator, "_graph", create=True)
        mocker.patch.object(
            orchestrator._execution_queue, "qsize", return_value=0
        )

        assert orchestrator._is_execution_finished() is True

    def test_is_execution_finished_with_pending_nodes(self, mocker):
        orchestrator = BasicOrchestrator()
        orchestrator._graph = mocker.Mock()
        # Mock the nx_graph property
        mocker.patch(
            (
                "qualibrate.orchestration.basic_orchestrator.BasicOrchestrator"
                ".nx_graph"
            ),
            new_callable=PropertyMock,
        )
        # Mock pending node statuses
        mock_status = {
            "node_1": ElementRunStatus.pending,
            "node_2": ElementRunStatus.finished,
        }
        orchestrator.targets = ["t1"]
        mocker.patch("networkx.get_node_attributes", return_value=mock_status)
        mocker.patch.object(
            orchestrator._execution_queue, "qsize", return_value=1
        )

        assert orchestrator._is_execution_finished() is False

    def test_cleanup_clears_queue(self):
        orchestrator = BasicOrchestrator()
        orchestrator._graph = "graph"
        orchestrator._is_stopped = True
        orchestrator.targets = orchestrator.initial_targets = ["q1"]
        orchestrator._execution_queue.put("test_node")
        orchestrator.cleanup()
        assert orchestrator._graph is None
        assert orchestrator._is_stopped is False
        assert orchestrator.initial_targets is None
        assert orchestrator.targets is None
        assert orchestrator._execution_history == []
        assert orchestrator._active_element is None
        assert orchestrator.final_outcomes == {}
        assert orchestrator._execution_queue.empty()

    def test_nx_graph_raises_error_if_no_graph(self):
        orchestrator = BasicOrchestrator()
        orchestrator._graph = None
        with pytest.raises(ValueError, match="Graph is not specified"):
            orchestrator.nx_graph  # noqa: B018

    def test_nx_graph_returns_correct_value(self, mocker):
        orchestrator = BasicOrchestrator()

        # Mock the _graph object
        mock_graph = mocker.patch.object(orchestrator, "_graph", create=True)
        mocker.patch.object(mock_graph, "_graph", create=True)

        assert orchestrator.nx_graph == mock_graph._graph

    def test_check_node_finished_without_graph(self):
        orchestrator = BasicOrchestrator()
        orchestrator._graph = None
        mock_node = MagicMock()
        assert orchestrator.check_node_finished(mock_node) is False

    def test_check_node_finished_with_finished_node(self, mocker):
        orchestrator = BasicOrchestrator()
        orchestrator._graph = "graph"
        mock_nx_graph = mocker.patch(
            (
                "qualibrate.orchestration.basic_orchestrator.BasicOrchestrator"
                ".nx_graph"
            ),
            new_callable=PropertyMock,
        )
        mock_node = MagicMock()
        mock_nx_graph.return_value.nodes = {
            mock_node: {
                QualibrationGraph.ELEMENT_STATUS_FIELD: (
                    ElementRunStatus.finished
                )
            }
        }
        assert orchestrator.check_node_finished(mock_node) is True

    def test_get_next_node_with_empty_queue(self):
        orchestrator = BasicOrchestrator()
        orchestrator._execution_queue = Queue()  # Empty queue
        assert orchestrator.get_next_element() is None

    def test_get_next_node_returns_node(self, mocker):
        orchestrator = BasicOrchestrator()
        mock_node = MagicMock()

        # Add mock node to the queue
        orchestrator._execution_queue.put(mock_node)

        # Patch the nx_graph property and set predecessors
        mock_nx_graph = mocker.patch(
            (
                "qualibrate.orchestration.basic_orchestrator.BasicOrchestrator"
                ".nx_graph"
            ),
            new_callable=PropertyMock,
        )
        mock_nx_graph.return_value.pred = {mock_node: []}

        # Mock check_node_finished to always return True
        mocker.patch.object(
            orchestrator, "check_node_finished", return_value=True
        )

        assert orchestrator.get_next_element() == mock_node

    def test_traverse_graph_logs_info(self, mocker):
        mock_logger = mocker.patch(
            "qualibrate.orchestration.basic_orchestrator.logger"
        )
        orchestrator = BasicOrchestrator()
        mock_graph = MagicMock()
        mock_graph.name = "test_graph"
        targets = ["target_1"]

        # Call the method and check logger
        orchestrator.traverse_graph(mock_graph, targets)
        mock_logger.info.assert_called_with(
            f"Traverse graph {mock_graph.name} with targets {targets}"
        )

    def test_traverse_graph_raises_error_if_no_parameters(self):
        orchestrator = BasicOrchestrator()
        mock_graph = MagicMock()
        mock_graph.full_parameters = None

        with pytest.raises(
            RuntimeError, match="Execution graph parameters not specified"
        ):
            orchestrator.traverse_graph(mock_graph, [])

    def test_get_in_targets_no_predecessors(self, mocker):
        """Test that _get_in_targets returns initial targets for nodes without predecessors"""
        orchestrator = BasicOrchestrator()
        orchestrator.initial_targets = ["q1", "q2", "q3"]

        mock_node = MagicMock()
        mocker.patch(
            "qualibrate.orchestration.basic_orchestrator.BasicOrchestrator.nx_graph",
        )

        result = orchestrator._get_in_targets_for_element(mock_node)

        assert result == ["q1", "q2", "q3"]

    def test_get_in_targets_with_single_predecessor(self, mocker):
        """Test that _get_in_targets gets targets from edge with single predecessor"""
        orchestrator = BasicOrchestrator()

        mock_node = MagicMock()
        mock_pred = MagicMock()

        mock_nx_graph = mocker.patch(
            "qualibrate.orchestration.basic_orchestrator.BasicOrchestrator.nx_graph",
            new_callable=PropertyMock,
        )
        mock_nx_graph.return_value.predecessors.return_value = [mock_pred]
        mock_nx_graph.return_value.edges = {
            (mock_pred, mock_node): {
                QualibrationGraph.EDGE_TARGETS_FIELD: ["q1", "q2"]
            }
        }

        result = orchestrator._get_in_targets_for_element(mock_node)

        assert set(result) == {"q1", "q2"}

    def test_get_in_targets_intersection_with_multiple_predecessors(
        self, mocker
    ):
        """Test that _get_in_targets computes intersection of targets from multiple predecessors"""
        orchestrator = BasicOrchestrator()

        mock_node = MagicMock()
        mock_pred1 = MagicMock()
        mock_pred2 = MagicMock()

        mock_nx_graph = mocker.patch(
            "qualibrate.orchestration.basic_orchestrator.BasicOrchestrator.nx_graph",
            new_callable=PropertyMock,
        )
        mock_nx_graph.return_value.predecessors.return_value = [
            mock_pred1,
            mock_pred2,
        ]
        mock_nx_graph.return_value.edges = {
            (mock_pred1, mock_node): {
                QualibrationGraph.EDGE_TARGETS_FIELD: ["q1", "q2", "q3"]
            },
            (mock_pred2, mock_node): {
                QualibrationGraph.EDGE_TARGETS_FIELD: ["q2", "q3", "q4"]
            },
        }

        result = orchestrator._get_in_targets_for_element(mock_node)

        # Should be intersection: q2 and q3
        assert set(result) == {"q2", "q3"}

    def test_set_out_targets_all_successful_skip_failed_disabled(self, mocker):
        """Test _set_out_targets with all successful targets when skip_failed is False"""
        orchestrator = BasicOrchestrator(skip_failed=False)

        mock_node = MagicMock()
        mock_successor = MagicMock()

        # Mock run summary
        mock_summary = MagicMock(spec=NodeRunSummary)
        mock_summary.successful_targets = ["q1", "q2"]
        mock_summary.initial_targets = ["q1", "q2", "q3"]
        mock_node.run_summary = mock_summary

        mock_nx_graph = mocker.patch(
            "qualibrate.orchestration.basic_orchestrator.BasicOrchestrator.nx_graph",
            new_callable=PropertyMock,
        )
        mock_nx_graph.return_value.successors.return_value = [mock_successor]
        mock_nx_graph.return_value.__getitem__.return_value = {
            mock_successor: {"scenario": Outcome.SUCCESSFUL}
        }
        mock_nx_graph.return_value.edges = {(mock_node, mock_successor): {}}

        orchestrator._graph = MagicMock()

        orchestrator._set_out_targets_for_element(mock_node)

        # Should use initial_targets when skip_failed=False
        assert mock_nx_graph.return_value.edges[(mock_node, mock_successor)][
            QualibrationGraph.EDGE_TARGETS_FIELD
        ] == ["q1", "q2", "q3"]

    def test_set_out_targets_all_successful_skip_failed_enabled(self, mocker):
        """Test _set_out_targets with successful targets when skip_failed is True"""
        orchestrator = BasicOrchestrator(skip_failed=True)

        mock_node = MagicMock()
        mock_successor = MagicMock()

        # Mock run summary
        mock_summary = MagicMock(spec=NodeRunSummary)
        mock_summary.successful_targets = ["q1", "q2"]
        mock_summary.initial_targets = ["q1", "q2", "q3"]
        mock_node.run_summary = mock_summary

        mock_nx_graph = mocker.patch(
            "qualibrate.orchestration.basic_orchestrator.BasicOrchestrator.nx_graph",
            new_callable=PropertyMock,
        )
        mock_nx_graph.return_value.successors.return_value = [mock_successor]
        mock_nx_graph.return_value.__getitem__.return_value = {
            mock_successor: {"scenario": Outcome.SUCCESSFUL}
        }
        mock_nx_graph.return_value.edges = {(mock_node, mock_successor): {}}

        orchestrator._graph = MagicMock()

        orchestrator._set_out_targets_for_element(mock_node)

        # Should use successful_targets when skip_failed=True
        assert mock_nx_graph.return_value.edges[(mock_node, mock_successor)][
            QualibrationGraph.EDGE_TARGETS_FIELD
        ] == ["q1", "q2"]

    def test_set_out_targets_with_failed_successor(self, mocker):
        """Test _set_out_targets routes failed targets to FAILED edge"""
        orchestrator = BasicOrchestrator()

        mock_node = MagicMock()
        mock_success_successor = MagicMock()
        mock_failure_successor = MagicMock()

        # Mock run summary with some failed targets
        mock_summary = MagicMock(spec=NodeRunSummary)
        mock_summary.successful_targets = ["q1", "q2"]
        mock_summary.failed_targets = ["q3"]
        mock_node.run_summary = mock_summary

        mock_nx_graph = mocker.patch(
            "qualibrate.orchestration.basic_orchestrator.BasicOrchestrator.nx_graph",
            new_callable=PropertyMock,
        )
        mock_nx_graph.return_value.successors.return_value = [
            mock_success_successor,
            mock_failure_successor,
        ]

        # Setup scenario attributes
        def getitem_side_effect(node):
            if node == mock_node:
                return {
                    mock_success_successor: {"scenario": Outcome.SUCCESSFUL},
                    mock_failure_successor: {"scenario": Outcome.FAILED},
                }
            raise KeyError(node)

        mock_nx_graph.return_value.__getitem__.side_effect = getitem_side_effect
        mock_nx_graph.return_value.edges = {
            (mock_node, mock_success_successor): {},
            (mock_node, mock_failure_successor): {},
        }

        orchestrator._graph = MagicMock()

        orchestrator._set_out_targets_for_element(mock_node)

        # Successful edge should get successful targets
        assert mock_nx_graph.return_value.edges[
            (mock_node, mock_success_successor)
        ][QualibrationGraph.EDGE_TARGETS_FIELD] == ["q1", "q2"]

        assert mock_nx_graph.return_value.edges[
            (mock_node, mock_failure_successor)
        ][QualibrationGraph.EDGE_TARGETS_FIELD] == ["q3"]

    def test_set_out_targets_raises_error_without_run_summary(self, mocker):
        """Test that _set_out_targets raises error if node has no run summary"""
        orchestrator = BasicOrchestrator()

        mock_node = MagicMock()
        mock_node.run_summary = None

        orchestrator._graph = MagicMock()

        with pytest.raises(RuntimeError, match="Can't set out targets"):
            orchestrator._set_out_targets_for_element(mock_node)

    def test_set_out_targets_multiple_successors_all_successful(self, mocker):
        """Test _set_out_targets with multiple successors on successful path"""
        orchestrator = BasicOrchestrator(skip_failed=True)

        mock_node = MagicMock()
        mock_succ1 = MagicMock()
        mock_succ2 = MagicMock()

        mock_summary = MagicMock(spec=NodeRunSummary)
        mock_summary.successful_targets = ["q1", "q2"]
        mock_summary.initial_targets = ["q1", "q2", "q3"]
        mock_node.run_summary = mock_summary

        mock_nx_graph = mocker.patch(
            "qualibrate.orchestration.basic_orchestrator.BasicOrchestrator.nx_graph",
            new_callable=PropertyMock,
        )
        mock_nx_graph.return_value.successors.return_value = [
            mock_succ1,
            mock_succ2,
        ]
        mock_nx_graph.return_value.__getitem__.return_value = {
            mock_succ1: {"scenario": Outcome.SUCCESSFUL},
            mock_succ2: {"scenario": Outcome.SUCCESSFUL},
        }
        mock_nx_graph.return_value.edges = {
            (mock_node, mock_succ1): {},
            (mock_node, mock_succ2): {},
        }

        orchestrator._graph = MagicMock()

        orchestrator._set_out_targets_for_element(mock_node)

        # Both successors should get successful targets
        assert mock_nx_graph.return_value.edges[(mock_node, mock_succ1)][
            QualibrationGraph.EDGE_TARGETS_FIELD
        ] == ["q1", "q2"]
        assert mock_nx_graph.return_value.edges[(mock_node, mock_succ2)][
            QualibrationGraph.EDGE_TARGETS_FIELD
        ] == ["q1", "q2"]

    def test_traverse_graph_with_success_and_failure_paths(self, mocker):
        """
        Integration test: Verify traverse_graph routes successful and failed targets correctly.

        Graph structure:
            node1 (root)
              ├─[SUCCESS]─> node2_success
              └─[FAILED]──> node3_failure

        node1 will have:
        - successful_targets: ["q1", "q2"]
        - failed_targets: ["q3"]

        We verify that:
        - node2_success receives ["q1", "q2"]
        - node3_failure receives ["q3"]
        """
        orchestrator = BasicOrchestrator(skip_failed=False)

        # Create mock nodes
        node1 = MagicMock(spec=QualibrationNode)
        node1.name = "node1"
        node2_success = MagicMock(spec=QualibrationNode)
        node2_success.name = "node2_success"
        node3_failure = MagicMock(spec=QualibrationNode)
        node3_failure.name = "node3_failure"

        # Mock node1's run summary with mixed results
        node1_summary = MagicMock(spec=NodeRunSummary)
        node1_summary.successful_targets = ["q1", "q2"]
        node1_summary.failed_targets = ["q3"]
        node1_summary.initial_targets = ["q1", "q2", "q3"]
        node1.run_summary = node1_summary
        node1.snapshot_idx = None
        node1.parameters = MagicMock(spec=RunnableParameters)
        node1.outcomes = {}

        # Mock successful node's run summary
        node2_summary = MagicMock(spec=NodeRunSummary)
        node2_summary.successful_targets = ["q1", "q2"]
        node2_summary.failed_targets = []
        node2_summary.initial_targets = ["q1", "q2"]
        node2_success.run_summary = node2_summary
        node2_success.snapshot_idx = None
        node2_success.parameters = MagicMock(spec=RunnableParameters)
        node2_success.outcomes = {}

        # Mock failure node's run summary
        node3_summary = MagicMock(spec=NodeRunSummary)
        node3_summary.successful_targets = []
        node3_summary.failed_targets = ["q3"]
        node3_summary.initial_targets = ["q3"]
        node3_failure.run_summary = node3_summary
        node3_failure.snapshot_idx = None
        node3_failure.parameters = MagicMock(spec=RunnableParameters)
        node3_failure.outcomes = {}
        node1.description = None
        node2_success.description = None
        node3_failure.description = None

        # Create mock graph
        mock_graph = MagicMock(spec=QualibrationGraph)
        mock_graph.name = "test_graph"

        # Setup graph parameters
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
        mock_params.node3_failure = node3_params
        mock_graph.full_parameters.nodes = mock_params

        # Create NetworkX graph structure
        import networkx as nx

        nx_graph = nx.DiGraph()

        # Add nodes with initial status
        nx_graph.add_node(node1, status=ElementRunStatus.pending, retries=0)
        nx_graph.add_node(
            node2_success, status=ElementRunStatus.pending, retries=0
        )
        nx_graph.add_node(
            node3_failure, status=ElementRunStatus.pending, retries=0
        )

        # Add edges with scenarios
        nx_graph.add_edge(node1, node2_success, scenario=Outcome.SUCCESSFUL)
        nx_graph.add_edge(node1, node3_failure, scenario=Outcome.FAILED)

        mock_graph._graph = nx_graph

        # Track which targets each node received
        received_targets = {}

        # Setup run methods to capture targets
        def node1_run(interactive=False, **kwargs):
            received_targets["node1"] = node1_params.targets
            return node1_summary

        def node2_run(interactive=False, **kwargs):
            received_targets["node2_success"] = node2_params.targets
            return node2_summary

        def node3_run(interactive=False, **kwargs):
            received_targets["node3_failure"] = node3_params.targets
            return node3_summary

        node1.run = node1_run
        node2_success.run = node2_run
        node3_failure.run = node3_run

        # Run the traversal
        orchestrator.traverse_graph(mock_graph, ["q1", "q2", "q3"])

        # Verify node1 received all initial targets
        assert received_targets["node1"] == ["q1", "q2", "q3"]

        # Verify node2_success received only successful targets
        assert set(received_targets["node2_success"]) == {"q1", "q2"}

        # Verify node3_failure received only failed targets
        assert set(received_targets["node3_failure"]) == {"q3"}

        # Verify all nodes were executed
        assert (
            nx_graph.nodes[node1][QualibrationGraph.ELEMENT_STATUS_FIELD]
            == ElementRunStatus.finished
        )
        assert (
            nx_graph.nodes[node2_success][
                QualibrationGraph.ELEMENT_STATUS_FIELD
            ]
            == ElementRunStatus.finished
        )
        assert (
            nx_graph.nodes[node3_failure][
                QualibrationGraph.ELEMENT_STATUS_FIELD
            ]
            == ElementRunStatus.finished
        )

    def test_traverse_graph_all_targets_succeed_no_failure_path(self, mocker):
        """
        Test traverse when all targets succeed and there's a failure path.
        The failure path node should not be executed.

        Graph structure:
            node1 (all targets succeed)
              ├─[SUCCESS]─> node2_success (should run)
              └─[FAILED]──> node3_failure (should NOT run - no failed targets)
        """
        orchestrator = BasicOrchestrator(skip_failed=False)

        # Create mock nodes
        node1 = MagicMock(spec=QualibrationNode)
        node1.name = "node1"
        node2_success = MagicMock(spec=QualibrationNode)
        node2_success.name = "node2_success"
        node3_failure = MagicMock(spec=QualibrationNode)
        node3_failure.name = "node3_failure"

        # node1: all targets succeed
        node1_summary = MagicMock(spec=NodeRunSummary)
        node1_summary.successful_targets = ["q1", "q2", "q3"]
        node1_summary.failed_targets = []
        node1_summary.initial_targets = ["q1", "q2", "q3"]
        node1.run_summary = node1_summary
        node1.snapshot_idx = None
        node1.parameters = MagicMock(spec=RunnableParameters)
        node1.outcomes = {}
        node1.description = None

        # node2_success
        node2_summary = MagicMock(spec=NodeRunSummary)
        node2_summary.successful_targets = ["q1", "q2", "q3"]
        node2_summary.failed_targets = []
        node2_summary.initial_targets = ["q1", "q2", "q3"]
        node2_success.run_summary = node2_summary
        node2_success.snapshot_idx = None
        node2_success.parameters = MagicMock(spec=RunnableParameters)
        node2_success.outcomes = {}
        node2_success.description = None

        # node3_failure should not run, but we'll track if it does
        node3_failure.run_summary = None
        node3_failure.snapshot_idx = None
        node3_failure.parameters = MagicMock(spec=RunnableParameters)
        node3_failure.outcomes = {}
        node3_failure.description = None

        # Create mock graph
        mock_graph = MagicMock(spec=QualibrationGraph)
        mock_graph.name = "test_graph"

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
        mock_params.node3_failure = node3_params
        mock_graph.full_parameters.nodes = mock_params

        # Create NetworkX graph
        import networkx as nx

        nx_graph = nx.DiGraph()

        nx_graph.add_node(node1, status=ElementRunStatus.pending, retries=0)
        nx_graph.add_node(
            node2_success, status=ElementRunStatus.pending, retries=0
        )
        nx_graph.add_node(
            node3_failure, status=ElementRunStatus.pending, retries=0
        )

        nx_graph.add_edge(node1, node2_success, scenario=Outcome.SUCCESSFUL)
        nx_graph.add_edge(node1, node3_failure, scenario=Outcome.FAILED)

        mock_graph._graph = nx_graph

        # Track execution
        execution_order = []

        def node1_run(interactive=False, **kwargs):
            execution_order.append("node1")
            return node1_summary

        def node2_run(interactive=False, **kwargs):
            execution_order.append("node2_success")
            return node2_summary

        def node3_run(interactive=False, **kwargs):
            execution_order.append("node3_failure")
            return node2_summary
            # This should never be called
            raise AssertionError(
                "node3_failure should not be executed when no targets failed"
            )

        node1.run = node1_run
        node2_success.run = node2_run
        node3_failure.run = node3_run

        # Run traversal
        orchestrator.traverse_graph(mock_graph, ["q1", "q2", "q3"])

        # Verify only node1 and node2_success were executed
        assert execution_order == ["node1", "node2_success"]

        # Verify node3_failure was NOT executed (still pending)
        assert (
            nx_graph.nodes[node3_failure][
                QualibrationGraph.ELEMENT_STATUS_FIELD
            ]
            == ElementRunStatus.pending
        )
