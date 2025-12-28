from queue import Queue
from unittest.mock import MagicMock, PropertyMock

import pytest

from qualibrate import QualibrationNode
from qualibrate.models.node_status import ElementRunStatus
from qualibrate.models.operational_condition import (
    LoopCondition,
    OperationalCondition,
)
from qualibrate.models.outcome import Outcome
from qualibrate.models.run_summary.node import NodeRunSummary
from qualibrate.orchestration.basic_orchestrator import BasicOrchestrator
from qualibrate.parameters import GraphParameters, RunnableParameters
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

    def test_q_graph_specified(self):
        orchestrator = BasicOrchestrator()
        orchestrator._graph = "graph"
        assert orchestrator.q_graph == "graph"

    def test_q_graph_not_specified(self):
        orchestrator = BasicOrchestrator()
        with pytest.raises(ValueError, match="Graph is not specified"):
            _ = orchestrator.q_graph

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
            orchestrator, "check_node_finished", side_effect=[False, True]
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
        """Test that _get_in_targets returns
        initial targets for nodes without predecessors"""
        orchestrator = BasicOrchestrator()
        orchestrator.initial_targets = ["q1", "q2", "q3"]

        mock_node = MagicMock()
        mocker.patch(
            "qualibrate.orchestration.basic_orchestrator.BasicOrchestrator.nx_graph",
        )

        result = orchestrator._get_in_targets_for_element(mock_node)

        assert sorted(result) == ["q1", "q2", "q3"]

    def test_get_in_targets_with_single_predecessor(self, mocker):
        """Test that _get_in_targets gets targets
        from edge with single predecessor"""
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
        """Test that _get_in_targets computes intersection of targets
        from multiple predecessors"""
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

    def test_get_in_targets_with_loop_targets(self, mocker):
        """Test that _get_in_targets includes
        loop targets from previous iterations"""
        orchestrator = BasicOrchestrator()

        mock_node = MagicMock()
        mock_pred = MagicMock()

        mock_nx_graph = mocker.patch(
            "qualibrate.orchestration.basic_orchestrator.BasicOrchestrator.nx_graph",
            new_callable=mocker.PropertyMock,
        )
        mock_nx_graph.return_value.predecessors.return_value = [mock_pred]
        mock_nx_graph.return_value.edges = {
            (mock_pred, mock_node): {
                QualibrationGraph.EDGE_TARGETS_FIELD: ["q1", "q2"]
            }
        }
        # Mock loop targets on the node itself
        mock_nx_graph.return_value.nodes = {
            mock_node: {
                QualibrationGraph.LOOP_TARGETS_FIELD: ["q3", "q4"],
                QualibrationGraph.ELEMENT_STATUS_FIELD: ElementRunStatus.pending,
            },
            mock_pred: {
                QualibrationGraph.ELEMENT_STATUS_FIELD: ElementRunStatus.finished
            },
        }

        result = orchestrator._get_in_targets_for_element(mock_node)

        # Should include both edge targets (q1, q2) AND loop targets (q3, q4)
        assert set(result) == {"q1", "q2", "q3", "q4"}

    def test_get_in_targets_with_loop_targets_and_multiple_predecessors(
        self, mocker
    ):
        """Test that loop targets are added to the intersection
        of predecessor targets"""
        orchestrator = BasicOrchestrator()

        mock_node = MagicMock()
        mock_pred1 = MagicMock()
        mock_pred2 = MagicMock()

        mock_nx_graph = mocker.patch(
            "qualibrate.orchestration.basic_orchestrator.BasicOrchestrator.nx_graph",
            new_callable=mocker.PropertyMock,
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
        # Mock loop targets
        mock_nx_graph.return_value.nodes = {
            mock_node: {
                QualibrationGraph.LOOP_TARGETS_FIELD: ["q5"],
                QualibrationGraph.ELEMENT_STATUS_FIELD: ElementRunStatus.pending,
            },
            mock_pred1: {
                QualibrationGraph.ELEMENT_STATUS_FIELD: ElementRunStatus.finished
            },
            mock_pred2: {
                QualibrationGraph.ELEMENT_STATUS_FIELD: ElementRunStatus.finished
            },
        }

        result = orchestrator._get_in_targets_for_element(mock_node)

        # Intersection of predecessors (q2, q3) + loop targets (q5)
        assert set(result) == {"q2", "q3", "q5"}

    def test_set_out_targets_all_successful_skip_failed_disabled(self, mocker):
        """Test _set_out_targets with all successful targets
        when skip_failed is False"""
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

        mock_edges = MagicMock()
        mock_edges.__getitem__.return_value = {"scenario": Outcome.SUCCESSFUL}
        mock_nx_graph.return_value.edges = mock_edges

        orchestrator._graph = MagicMock()

        orchestrator._set_out_targets_for_element(mock_node)

        # Should use initial_targets when skip_failed=False
        assert mock_nx_graph.return_value.edges[(mock_node, mock_successor)][
            QualibrationGraph.EDGE_TARGETS_FIELD
        ] == ["q1", "q2", "q3"]

    def test_set_out_targets_all_successful_skip_failed_enabled(self, mocker):
        """Test _set_out_targets with successful targets
        when skip_failed is True"""
        orchestrator = BasicOrchestrator(skip_failed=True)

        mock_node = MagicMock()
        mock_successor = MagicMock()
        mock_edges = MagicMock()

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

        mock_edges.__getitem__.return_value = {"scenario": Outcome.SUCCESSFUL}
        mock_nx_graph.return_value.edges = mock_edges

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
            "qualibrate.orchestration."
            "basic_orchestrator.BasicOrchestrator.nx_graph",
            new_callable=PropertyMock,
        )
        mock_nx_graph.return_value.successors.return_value = [
            mock_success_successor,
            mock_failure_successor,
        ]

        # Fix: Mock edges to support edges[element, successor]["scenario"]
        mock_edges = MagicMock()

        # Create actual dict objects that can be modified
        success_edge_data = {
            "scenario": Outcome.SUCCESSFUL,
            "operational_condition": OperationalCondition(),
        }
        failure_edge_data = {
            "scenario": Outcome.FAILED,
            "operational_condition": OperationalCondition(),  # Empty condition
        }

        def edges_getitem(key):
            element, successor = key
            if successor == mock_success_successor:
                return success_edge_data
            elif successor == mock_failure_successor:
                return failure_edge_data
            raise KeyError(key)

        mock_edges.__getitem__.side_effect = edges_getitem
        mock_nx_graph.return_value.edges = mock_edges

        orchestrator._graph = MagicMock()

        orchestrator._set_out_targets_for_element(mock_node)

        # Successful edge should get successful targets
        assert success_edge_data[QualibrationGraph.EDGE_TARGETS_FIELD] == [
            "q1",
            "q2",
        ]

        # Failed edge should get failed targets
        assert failure_edge_data[QualibrationGraph.EDGE_TARGETS_FIELD] == ["q3"]

    def test_set_out_targets_raises_error_without_run_summary(self, mocker):
        """Test that _set_out_targets raises error
        if node has no run summary"""
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
            "qualibrate.orchestration.basic_orchestrator."
            "BasicOrchestrator.nx_graph",
            new_callable=PropertyMock,
        )
        mock_nx_graph.return_value.successors.return_value = [
            mock_succ1,
            mock_succ2,
        ]

        # Fix: Mock edges to support edges[element, successor]["scenario"]
        mock_edges = MagicMock()

        # Create actual dict objects that can be modified
        succ1_edge_data = {"scenario": Outcome.SUCCESSFUL}
        succ2_edge_data = {"scenario": Outcome.SUCCESSFUL}

        def edges_getitem(key):
            element, successor = key
            if successor == mock_succ1:
                return succ1_edge_data
            elif successor == mock_succ2:
                return succ2_edge_data
            raise KeyError(key)

        mock_edges.__getitem__.side_effect = edges_getitem
        mock_nx_graph.return_value.edges = mock_edges

        orchestrator._graph = MagicMock()

        orchestrator._set_out_targets_for_element(mock_node)

        # Both successors should get successful targets
        assert succ1_edge_data[QualibrationGraph.EDGE_TARGETS_FIELD] == [
            "q1",
            "q2",
        ]
        assert succ2_edge_data[QualibrationGraph.EDGE_TARGETS_FIELD] == [
            "q1",
            "q2",
        ]

    def test_is_loop_iteration_needed_no_conditions(self):
        """Test that loop stops immediately when
        no loop conditions are defined"""
        orchestrator = BasicOrchestrator()
        mock_element = MagicMock()
        mock_element.name = "test_element"

        mock_graph = MagicMock()
        mock_graph._loop_conditions = {}

        orchestrator._graph = mock_graph

        iteration_generator = orchestrator._is_loop_iteration_needed(
            mock_element
        )

        # First yield should be True (initial execution)
        assert next(iteration_generator) is True
        # Second yield should be False (no loop conditions)
        assert iteration_generator.send(None) is False

    def test_is_loop_iteration_needed_max_iterations(self):
        """Test that loop respects max_iterations limit"""
        orchestrator = BasicOrchestrator()
        mock_element = MagicMock()
        mock_element.name = "test_element"
        mock_element.run_summary = None

        mock_graph = MagicMock()
        max_iterations = 3
        mock_graph._loop_conditions = {
            "test_element": LoopCondition(max_iterations=max_iterations)
        }

        orchestrator._graph = mock_graph

        iteration_generator = orchestrator._is_loop_iteration_needed(
            mock_element
        )

        # First yield - initial execution
        assert next(iteration_generator) is True

        for _iteration_index in range(1, max_iterations):
            assert iteration_generator.send(None) is True

        assert iteration_generator.send(None) is False

    def test_is_loop_iteration_needed_on_function_with_reuse_targets(
        self, mocker
    ):
        """Test loop with on_function that filters targets for re-execution"""
        orchestrator = BasicOrchestrator()
        mock_element = MagicMock()
        mock_element.name = "test_element"

        # Mock run summary with initial targets
        mock_summary = MagicMock()
        mock_summary.initial_targets = ["q1", "q2", "q3"]
        mock_element.run_summary = mock_summary

        # Filter function: only reuse targets q1 and q2
        def filter_func(element, target):
            return target in ["q1", "q2"]

        max_iterations = 5
        mock_graph = MagicMock()
        mock_graph._loop_conditions = {
            "test_element": LoopCondition(
                on_function=filter_func, max_iterations=max_iterations
            )
        }

        mock_nx_graph = mocker.patch(
            "qualibrate.orchestration.basic_orchestrator.BasicOrchestrator.nx_graph",
            new_callable=mocker.PropertyMock,
        )
        mock_nx_graph.return_value.nodes = {
            mock_element: {
                QualibrationGraph.ELEMENT_STATUS_FIELD: ElementRunStatus.pending
            }
        }

        orchestrator._graph = mock_graph

        iteration_generator = orchestrator._is_loop_iteration_needed(
            mock_element
        )

        # Initial execution
        assert next(iteration_generator) is True

        # After first run, should continue with q1, q2
        assert iteration_generator.send(None) is True

        # Check that loop targets were set
        assert mock_nx_graph.return_value.nodes[mock_element][
            QualibrationGraph.LOOP_TARGETS_FIELD
        ] == ["q1", "q2"]

    def test_is_loop_iteration_needed_on_function_no_reuse_targets(self):
        """Test loop stops when on_function filters out all targets"""
        orchestrator = BasicOrchestrator()
        mock_element = MagicMock()
        mock_element.name = "test_element"

        mock_summary = MagicMock()
        mock_summary.initial_targets = ["q1", "q2", "q3"]
        mock_element.run_summary = mock_summary

        # Filter function: reject all targets
        def filter_func(element, target):
            return False

        mock_graph = MagicMock()
        mock_graph._loop_conditions = {
            "test_element": LoopCondition(on_function=filter_func)
        }

        orchestrator._graph = mock_graph

        iteration_generator = orchestrator._is_loop_iteration_needed(
            mock_element
        )

        # Initial execution
        assert next(iteration_generator) is True

        # No targets to reuse, should stop
        assert iteration_generator.send(None) is False

    def test_is_loop_iteration_needed_on_generator(self):
        """Test loop with generator function that controls iteration"""
        orchestrator = BasicOrchestrator()
        mock_element = MagicMock()
        mock_element.name = "test_element"

        mock_summary = MagicMock()
        mock_summary.initial_targets = ["q1", "q2"]
        mock_element.run_summary = mock_summary

        # Generator function: accept q1 once, then stop
        def generator_func():
            count = 0
            while True:
                element, target = yield
                if target == "q1" and count < 1:
                    count += 1
                    yield True
                else:
                    yield False

        mock_graph = MagicMock()
        mock_graph._loop_conditions = {
            "test_element": LoopCondition(on_generator=generator_func)
        }

        orchestrator._graph = mock_graph

        iteration_generator = orchestrator._is_loop_iteration_needed(
            mock_element
        )

        # Initial execution
        assert next(iteration_generator) is True
        assert iteration_generator.send(None) is True
        assert iteration_generator.send(None) is False

    def test_traverse_graph_with_loop_condition(self):
        """Integration test: Graph with a node
        that loops based on a condition"""
        orchestrator = BasicOrchestrator()

        # Create mock node that "fails" first time, succeeds second time
        node1 = MagicMock(spec=QualibrationNode)
        node1.name = "looping_node"
        node1.description = None
        node1.parameters = MagicMock(spec=RunnableParameters)
        node1.outcomes = {}
        node1.snapshot_idx = None

        # Track execution count
        execution_count = [0]

        # First run: some targets fail
        summary1 = MagicMock(spec=NodeRunSummary)
        summary1.successful_targets = ["q1"]
        summary1.failed_targets = ["q2"]
        summary1.initial_targets = ["q1", "q2"]

        # Second run: all succeed
        summary2 = MagicMock(spec=NodeRunSummary)
        summary2.successful_targets = ["q2"]
        summary2.failed_targets = []
        summary2.initial_targets = ["q2"]

        def node_run(interactive=False, **kwargs):
            execution_count[0] += 1
            if execution_count[0] == 1:
                node1.run_summary = summary1
                return summary1
            else:
                node1.run_summary = summary2
                return summary2

        node1.run = node_run

        mock_graph = MagicMock(spec=QualibrationGraph)
        mock_graph.name = "test_graph"

        # Loop condition: retry failed targets
        def should_retry(element, target):
            return target in element.run_summary.failed_targets

        mock_graph._loop_conditions = {
            "looping_node": LoopCondition(
                on_function=should_retry, max_iterations=5
            )
        }

        # Setup parameters
        mock_params = MagicMock()
        node1_params = MagicMock()
        node1_params.targets = None
        node1_params.model_dump.return_value = {}
        mock_params.looping_node = node1_params
        mock_graph.full_parameters.nodes = mock_params

        # Create NetworkX graph
        import networkx as nx

        nx_graph = nx.DiGraph()
        nx_graph.add_node(node1, status=ElementRunStatus.pending, retries=0)
        mock_graph._graph = nx_graph

        # Run traversal
        orchestrator.traverse_graph(mock_graph, ["q1", "q2"])

        # Node should have been executed twice (initial + 1 retry for q2)
        assert execution_count[0] == 2

        # Final status should be finished
        assert (
            nx_graph.nodes[node1][QualibrationGraph.ELEMENT_STATUS_FIELD]
            == ElementRunStatus.finished
        )

    def test_traverse_graph_with_success_and_failure_paths(self, mocker):
        """
        Integration test: Verify traverse_graph routes successful
         and failed targets correctly.

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
        mock_graph._loop_conditions = {}

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
        nx_graph.add_edge(
            node1,
            node2_success,
            scenario=Outcome.SUCCESSFUL,
            operational_condition=OperationalCondition(),
        )
        nx_graph.add_edge(
            node1,
            node3_failure,
            scenario=Outcome.FAILED,
            operational_condition=OperationalCondition(),
        )

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
        assert set(received_targets["node1"]) == {"q1", "q2", "q3"}

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

        nx_graph.add_edge(
            node1,
            node2_success,
            scenario=Outcome.SUCCESSFUL,
            operational_condition=OperationalCondition(),
        )
        nx_graph.add_edge(
            node1,
            node3_failure,
            scenario=Outcome.FAILED,
            operational_condition=OperationalCondition(),
        )

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

    def test_traverse_graph_success_path_with_no_targets_is_skipped(self):
        """
        If a node finishes with no successful targets, the success edge should
        not enqueue its successor, while the failure edge should still run.

        Graph structure:
            node1 (all targets fail)
              ├─[SUCCESS]─> node2_success (should NOT run)
              └─[FAILED]──> node3_failure (should run with failed targets)
        """
        orchestrator = BasicOrchestrator(skip_failed=False)

        # Create mock nodes
        node1 = MagicMock(spec=QualibrationNode)
        node1.name = "node1"
        node2_success = MagicMock(spec=QualibrationNode)
        node2_success.name = "node2_success"
        node3_failure = MagicMock(spec=QualibrationNode)
        node3_failure.name = "node3_failure"

        # node1: all targets fail
        node1_summary = MagicMock(spec=NodeRunSummary)
        node1_summary.successful_targets = []
        node1_summary.failed_targets = ["q1"]
        node1_summary.initial_targets = ["q1"]
        node1.run_summary = node1_summary
        node1.snapshot_idx = None
        node1.parameters = MagicMock(spec=RunnableParameters)
        node1.outcomes = {}
        node1.description = None

        # node2_success: should not run; keep attributes but no run_summary
        node2_success.run_summary = None
        node2_success.snapshot_idx = None
        node2_success.parameters = MagicMock(spec=RunnableParameters)
        node2_success.outcomes = {}
        node2_success.description = None

        # node3_failure
        node3_summary = MagicMock(spec=NodeRunSummary)
        node3_summary.successful_targets = []
        node3_summary.failed_targets = ["q1"]
        node3_summary.initial_targets = ["q1"]
        node3_failure.run_summary = node3_summary
        node3_failure.snapshot_idx = None
        node3_failure.parameters = MagicMock(spec=RunnableParameters)
        node3_failure.outcomes = {}
        node3_failure.description = None

        # Create mock graph
        mock_graph = MagicMock(spec=QualibrationGraph)
        mock_graph.name = "test_graph"
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

        nx_graph.add_edge(
            node1,
            node2_success,
            scenario=Outcome.SUCCESSFUL,
            operational_condition=OperationalCondition(),
        )
        nx_graph.add_edge(
            node1,
            node3_failure,
            scenario=Outcome.FAILED,
            operational_condition=OperationalCondition(),
        )

        mock_graph._graph = nx_graph

        execution_order = []

        def node1_run(interactive=False, **kwargs):
            execution_order.append("node1")
            return node1_summary

        def node2_run(interactive=False, **kwargs):
            execution_order.append("node2_success")
            return node3_summary  # Should not be called

        def node3_run(interactive=False, **kwargs):
            execution_order.append("node3_failure")
            return node3_summary

        node1.run = node1_run
        node2_success.run = node2_run
        node3_failure.run = node3_run

        orchestrator.traverse_graph(mock_graph, ["q1"])

        # Only node1 and node3_failure should have run
        assert execution_order == ["node1", "node3_failure"]
        assert (
            nx_graph.nodes[node2_success][
                QualibrationGraph.ELEMENT_STATUS_FIELD
            ]
            == ElementRunStatus.pending
        )
        assert (
            nx_graph.nodes[node3_failure][
                QualibrationGraph.ELEMENT_STATUS_FIELD
            ]
            == ElementRunStatus.finished
        )


def test_execute_condition_with_lambda_function():
    """Test _execute_condition with a simple function condition"""

    orchestrator = BasicOrchestrator()

    mock_element = MagicMock()
    mock_element.results = {
        "q1": {"value": 10},
        "q2": {"value": 5},
        "q3": {"value": 15},
    }

    # Condition: filter targets where value > 8
    condition = OperationalCondition(
        on_function=lambda el, target: el.results[target]["value"] > 8
    )

    targets = ["q1", "q2", "q3"]
    result = orchestrator._execute_condition(condition, mock_element, targets)

    assert set(result) == {"q1", "q3"}


def test_execute_condition_with_function():
    """Test _execute_condition with a simple function condition"""

    orchestrator = BasicOrchestrator()

    mock_element = MagicMock()
    mock_element.results = {
        "q1": {"value": 10},
        "q2": {"value": 5},
        "q3": {"value": 15},
    }

    def condition_function(el, target):
        return el.results[target]["value"] > 8

    # Condition: filter targets where value > 8
    condition = OperationalCondition(on_function=condition_function)

    targets = ["q1", "q2", "q3"]
    result = orchestrator._execute_condition(condition, mock_element, targets)

    assert set(result) == {"q1", "q3"}


def test_execute_condition_with_generator():
    """Test _execute_condition with a generator condition"""
    from qualibrate.models.operational_condition import OperationalCondition

    orchestrator = BasicOrchestrator()

    mock_element = MagicMock()
    mock_element.results = {
        "q1": {"fidelity": 0.96},
        "q2": {"fidelity": 0.92},
        "q3": {"fidelity": 0.98},
    }

    # Generator condition: filter targets where fidelity > 0.95
    def condition_gen():
        while True:
            element, target = yield
            yield element.results[target]["fidelity"] > 0.95

    condition = OperationalCondition(on_generator=condition_gen)

    targets = ["q1", "q2", "q3"]
    result = orchestrator._execute_condition(condition, mock_element, targets)

    assert set(result) == {"q1", "q3"}


def test_set_out_targets_with_operational_condition_on_failure(mocker):
    """Test _set_out_targets routes targets through
    operational condition on failed edge"""
    orchestrator = BasicOrchestrator()

    mock_node = MagicMock()
    mock_node.results = {
        "q1": {"error_count": 0},
        "q2": {"error_count": 5},
        "q3": {"error_count": 2},
        "q4": {"error_count": 5},
    }

    mock_success_successor = MagicMock()
    mock_failure_successor = MagicMock()

    # Mock run summary with some failed targets
    mock_summary = MagicMock(spec=NodeRunSummary)
    mock_summary.successful_targets = ["q1", "q2"]
    mock_summary.failed_targets = ["q4", "q3"]
    mock_node.run_summary = mock_summary

    mock_nx_graph = mocker.patch(
        "qualibrate.orchestration.basic_orchestrator.BasicOrchestrator.nx_graph",
        new_callable=PropertyMock,
    )
    mock_nx_graph.return_value.successors.return_value = [
        mock_success_successor,
        mock_failure_successor,
    ]

    # Operational condition: only route targets with error_count <= 3
    op_condition = OperationalCondition(
        on_function=lambda node, target: node.results[target]["error_count"]
        <= 3
    )

    mock_edges = MagicMock()

    success_edge_data = {"scenario": Outcome.SUCCESSFUL}
    failure_edge_data = {
        "scenario": Outcome.FAILED,
        "operational_condition": op_condition,
    }

    def edges_getitem(key):
        element, successor = key
        if successor == mock_success_successor:
            return success_edge_data
        elif successor == mock_failure_successor:
            return failure_edge_data
        raise KeyError(key)

    mock_edges.__getitem__.side_effect = edges_getitem
    mock_nx_graph.return_value.edges = mock_edges

    orchestrator._graph = MagicMock()

    orchestrator._set_out_targets_for_element(mock_node)

    # Successful edge should get successful targets
    assert success_edge_data[QualibrationGraph.EDGE_TARGETS_FIELD] == [
        "q1",
        "q2",
    ]

    # Failed edge should get failed targets filtered by condition
    # (q3 has error_count=2 <= 3)
    assert failure_edge_data[QualibrationGraph.EDGE_TARGETS_FIELD] == ["q3"]


def test_connect_on_failure_with_condition_lambda_function(
    pre_setup_graph_init, mock_library
):
    """Test that connect_on_failure() with condition function works correctly"""
    (nodes, _, _, _) = pre_setup_graph_init

    with QualibrationGraph.build(
        name="test_graph",
        parameters=GraphParameters(),
    ) as graph:
        graph.add_nodes(nodes["node1"], nodes["node2"])
        graph.connect_on_failure(
            "node1", "node2", on=lambda element, target: True
        )

    # Check connectivity
    assert ("node1", "node2") in graph._connectivity
    assert (
        graph._connectivity[("node1", "node2")][
            QualibrationGraph.RUN_SCENARIO_FIELD
        ]
        == Outcome.FAILED
    )
    assert (
        graph._connectivity[("node1", "node2")][
            QualibrationGraph.OPERATIONAL_CONDITION_FIELD
        ].on_function
        is not None
    )


def test_connect_on_failure_with_condition_generator(
    pre_setup_graph_init, mock_library
):
    """Test that connect_on_failure() with
    generator condition works correctly"""
    (nodes, _, _, _) = pre_setup_graph_init

    def condition_gen():
        while True:
            element, target = yield
            yield True

    with QualibrationGraph.build(
        name="test_graph",
        parameters=GraphParameters(),
    ) as graph:
        graph.add_nodes(nodes["node1"], nodes["node2"])
        graph.connect_on_failure("node1", "node2", on=condition_gen)

    # Check connectivity
    assert ("node1", "node2") in graph._connectivity
    assert (
        graph._connectivity[("node1", "node2")][
            QualibrationGraph.RUN_SCENARIO_FIELD
        ]
        == Outcome.FAILED
    )
    assert (
        graph._connectivity[("node1", "node2")][
            QualibrationGraph.OPERATIONAL_CONDITION_FIELD
        ].on_generator
        is not None
    )


def test_get_next_element_skips_already_finished_node(mocker):
    """Test that get_next_element skips nodes
    that are already finished (duplicate queue entries)"""
    orchestrator = BasicOrchestrator()

    mock_finished_node = MagicMock()
    mock_pending_node = MagicMock()

    # Simulate duplicate: add finished node twice, then pending node
    orchestrator._execution_queue.put(mock_finished_node)
    orchestrator._execution_queue.put(
        mock_finished_node
    )  # Duplicate! (intentionally)
    orchestrator._execution_queue.put(mock_pending_node)

    # Mock nx_graph
    mock_nx_graph = mocker.patch(
        "qualibrate.orchestration.basic_orchestrator.BasicOrchestrator.nx_graph",
        new_callable=PropertyMock,
    )
    mock_nx_graph.return_value.pred = {
        mock_finished_node: [],
        mock_pending_node: [],
    }

    # Mock check_node_finished
    def check_finished(node):
        return node == mock_finished_node

    mocker.patch.object(
        orchestrator, "check_node_finished", side_effect=check_finished
    )

    # Should skip both instances of finished_node and return pending_node
    result = orchestrator.get_next_element()
    assert result == mock_pending_node


def test_get_next_element_skips_node_with_unfinished_predecessors(mocker):
    """Test that get_next_element skips
    node if any predecessor is not finished"""
    orchestrator = BasicOrchestrator()

    mock_node = MagicMock()
    mock_pred1 = MagicMock()
    mock_pred2 = MagicMock()

    # Add node to queue
    orchestrator._execution_queue.put(mock_node)

    # Mock nx_graph
    mock_nx_graph = mocker.patch(
        "qualibrate.orchestration.basic_orchestrator.BasicOrchestrator.nx_graph",
        new_callable=PropertyMock,
    )
    mock_nx_graph.return_value.pred = {mock_node: [mock_pred1, mock_pred2]}

    # Mock check_node_finished: pred1 finished,
    # pred2 not finished, node not finished
    def check_finished(node):
        return node == mock_pred1

    mocker.patch.object(
        orchestrator, "check_node_finished", side_effect=check_finished
    )

    # Should return None because pred2 is not finished
    result = orchestrator.get_next_element()
    assert result is None

    # Queue should now be empty (node was dequeued but not returned)
    assert orchestrator._execution_queue.empty()


def test_execute_condition_with_empty_condition_returns_all_targets():
    """Test _execute_condition with empty operational condition
    (no function, no generator) returns all targets"""

    orchestrator = BasicOrchestrator()

    mock_element = MagicMock()

    # Empty condition (both on_function and on_generator are None)
    condition = OperationalCondition()

    targets = ["q1", "q2", "q3"]
    result = orchestrator._execute_condition(condition, mock_element, targets)

    # Should return all targets when no condition is specified
    assert result == targets


def test_set_out_targets_with_empty_operational_condition_on_failure(mocker):
    """Test that empty operational condition
    on failed edge passes all failed targets"""
    orchestrator = BasicOrchestrator()

    mock_node = MagicMock()
    mock_success_successor = MagicMock()
    mock_failure_successor = MagicMock()

    # Mock run summary
    mock_summary = MagicMock(spec=NodeRunSummary)
    mock_summary.successful_targets = ["q1"]
    mock_summary.failed_targets = ["q2", "q3"]
    mock_node.run_summary = mock_summary

    mock_nx_graph = mocker.patch(
        "qualibrate.orchestration.basic_orchestrator.BasicOrchestrator.nx_graph",
        new_callable=PropertyMock,
    )
    mock_nx_graph.return_value.successors.return_value = [
        mock_success_successor,
        mock_failure_successor,
    ]

    mock_edges = MagicMock()

    success_edge_data = {
        "scenario": Outcome.SUCCESSFUL,
        "operational_condition": OperationalCondition(),
    }
    # Empty operational condition - should pass all failed targets
    failure_edge_data = {
        "scenario": Outcome.FAILED,
        "operational_condition": OperationalCondition(),  # Empty
    }

    def edges_getitem(key):
        element, successor = key
        if successor == mock_success_successor:
            return success_edge_data
        elif successor == mock_failure_successor:
            return failure_edge_data
        raise KeyError(key)

    mock_edges.__getitem__.side_effect = edges_getitem
    mock_nx_graph.return_value.edges = mock_edges

    orchestrator._graph = MagicMock()

    orchestrator._set_out_targets_for_element(mock_node)

    # Successful edge gets successful targets
    assert success_edge_data[QualibrationGraph.EDGE_TARGETS_FIELD] == ["q1"]

    # Failed edge with empty condition should get ALL failed targets
    assert set(failure_edge_data[QualibrationGraph.EDGE_TARGETS_FIELD]) == {
        "q2",
        "q3",
    }


def test_get_next_element_returns_node_when_all_predecessors_finished(mocker):
    """Test that get_next_element returns
    node when all predecessors are finished"""
    orchestrator = BasicOrchestrator()

    mock_node = MagicMock()
    mock_pred1 = MagicMock()
    mock_pred2 = MagicMock()

    orchestrator._execution_queue.put(mock_node)

    mock_nx_graph = mocker.patch(
        "qualibrate.orchestration.basic_orchestrator.BasicOrchestrator.nx_graph",
        new_callable=PropertyMock,
    )
    mock_nx_graph.return_value.pred = {mock_node: [mock_pred1, mock_pred2]}

    def check_finished(node):
        return node != mock_node

    mocker.patch.object(
        orchestrator, "check_node_finished", side_effect=check_finished
    )

    # Should return the node because ALL predecessors are finished
    result = orchestrator.get_next_element()
    assert result == mock_node

    # Queue should now be empty (node was dequeued and returned)
    assert orchestrator._execution_queue.empty()


def test_execute_condition_with_generator_that_returns_false():
    """Test generator condition that filters out all targets"""
    from qualibrate.models.operational_condition import OperationalCondition

    orchestrator = BasicOrchestrator()
    mock_element = MagicMock()

    # Generator that always returns False
    def never_pass():
        while True:
            element, target = yield
            yield False

    condition = OperationalCondition(on_generator=never_pass)
    targets = ["q1", "q2", "q3"]
    result = orchestrator._execute_condition(condition, mock_element, targets)

    assert result == []


def test_set_out_targets_multiple_failed_edges_with_different_conditions(
    mocker,
):
    """Test routing to multiple failed edges with different conditions"""
    from qualibrate.models.operational_condition import OperationalCondition

    orchestrator = BasicOrchestrator()

    mock_node = MagicMock()
    mock_node.results = {
        "q1": {"error_type": "timeout"},
        "q2": {"error_type": "calibration"},
        "q3": {"error_type": "timeout"},
    }

    mock_success_successor = MagicMock()
    mock_timeout_handler = MagicMock()
    mock_calibration_handler = MagicMock()

    mock_summary = MagicMock(spec=NodeRunSummary)
    mock_summary.successful_targets = []
    mock_summary.failed_targets = ["q1", "q2", "q3"]
    mock_node.run_summary = mock_summary

    mock_nx_graph = mocker.patch(
        "qualibrate.orchestration.basic_orchestrator.BasicOrchestrator.nx_graph",
        new_callable=PropertyMock,
    )
    mock_nx_graph.return_value.successors.return_value = [
        mock_success_successor,
        mock_timeout_handler,
        mock_calibration_handler,
    ]

    # Different conditions for different error types
    timeout_condition = OperationalCondition(
        on_function=lambda node, target: node.results[target]["error_type"]
        == "timeout"
    )
    calibration_condition = OperationalCondition(
        on_function=lambda node, target: node.results[target]["error_type"]
        == "calibration"
    )

    mock_edges = MagicMock()

    success_edge_data = {
        "scenario": Outcome.SUCCESSFUL,
        "operational_condition": OperationalCondition(),
    }
    timeout_edge_data = {
        "scenario": Outcome.FAILED,
        "operational_condition": timeout_condition,
    }
    calibration_edge_data = {
        "scenario": Outcome.FAILED,
        "operational_condition": calibration_condition,
    }

    def edges_getitem(key):
        element, successor = key
        if successor == mock_success_successor:
            return success_edge_data
        elif successor == mock_timeout_handler:
            return timeout_edge_data
        elif successor == mock_calibration_handler:
            return calibration_edge_data
        raise KeyError(key)

    mock_edges.__getitem__.side_effect = edges_getitem
    mock_nx_graph.return_value.edges = mock_edges

    orchestrator._graph = MagicMock()

    # Adding the right parameters to the edge
    orchestrator._set_out_targets_for_element(mock_node)

    # Timeout handler should get q1 and q3
    assert set(timeout_edge_data[QualibrationGraph.EDGE_TARGETS_FIELD]) == {
        "q1",
        "q3",
    }

    # Calibration handler should get q2
    assert calibration_edge_data[QualibrationGraph.EDGE_TARGETS_FIELD] == ["q2"]

    # Success edge should be empty
    assert success_edge_data[QualibrationGraph.EDGE_TARGETS_FIELD] == []


class TestFillFinalOutcomes:
    def setup_method(self):
        # Common setup for all tests
        self.orchestrator = BasicOrchestrator()
        self.orchestrator.final_outcomes = {}
        self.orchestrator.initial_targets = ["t1", "t2", "t3", "t4"]

    def make_node(self, outcomes):
        node = MagicMock()
        node.outcomes = outcomes  # dict: {target: Outcome}
        return node

    def test_all_targets_successful(self, mocker):
        """All targets reach leaves and succeed."""
        leaf1 = self.make_node(
            {"t1": Outcome.SUCCESSFUL, "t2": Outcome.SUCCESSFUL}
        )
        leaf2 = self.make_node(
            {"t1": Outcome.SUCCESSFUL, "t2": Outcome.SUCCESSFUL}
        )

        # Patch the nx_graph property
        mock_nx_graph = mocker.patch.object(
            self.orchestrator.__class__, "nx_graph", new_callable=PropertyMock
        )

        mock_graph = MagicMock()
        mock_graph.succ = {leaf1: [], leaf2: []}
        mock_nx_graph.return_value = mock_graph

        self.orchestrator._fill_final_outcomes()

        assert self.orchestrator.final_outcomes["t1"] == Outcome.SUCCESSFUL
        assert self.orchestrator.final_outcomes["t2"] == Outcome.SUCCESSFUL
        # t3 and t4 never reached any leaf → fail
        assert self.orchestrator.final_outcomes["t3"] == Outcome.FAILED
        assert self.orchestrator.final_outcomes["t4"] == Outcome.FAILED

    def test_some_targets_fail(self, mocker):
        """Some targets fail on at least one leaf node."""
        leaf1 = self.make_node({"t1": Outcome.SUCCESSFUL, "t2": Outcome.FAILED})
        leaf2 = self.make_node(
            {"t1": Outcome.SUCCESSFUL, "t2": Outcome.SUCCESSFUL}
        )

        # Patch the nx_graph property
        mock_nx_graph = mocker.patch.object(
            self.orchestrator.__class__, "nx_graph", new_callable=PropertyMock
        )

        mock_graph = MagicMock()
        mock_graph.succ = {leaf1: [], leaf2: []}
        mock_nx_graph.return_value = mock_graph

        self.orchestrator._fill_final_outcomes()

        # t1 succeeds on all → successful
        assert self.orchestrator.final_outcomes["t1"] == Outcome.SUCCESSFUL
        # t2 fails on one leaf → failed
        assert self.orchestrator.final_outcomes["t2"] == Outcome.FAILED
        # t3 and t4 never reached any leaf → fail
        assert self.orchestrator.final_outcomes["t3"] == Outcome.FAILED
        assert self.orchestrator.final_outcomes["t4"] == Outcome.FAILED

    def test_target_missing_from_leaf_outcomes(self, mocker):
        """Target missing from leaf outcomes defaults to SUCCESSFUL."""
        leaf1 = self.make_node({"t1": Outcome.SUCCESSFUL})

        mock_nx_graph = mocker.patch.object(
            self.orchestrator.__class__, "nx_graph", new_callable=PropertyMock
        )

        mock_graph = MagicMock()
        mock_graph.succ = {leaf1: []}
        mock_nx_graph.return_value = mock_graph

        self.orchestrator.initial_targets = ["t1", "t2"]
        self.orchestrator._fill_final_outcomes()

        assert self.orchestrator.final_outcomes["t1"] == Outcome.SUCCESSFUL
        # t2 never appears in any leaf node outcomes
        assert self.orchestrator.final_outcomes["t2"] == Outcome.FAILED
