import pytest
from unittest.mock import MagicMock, patch, PropertyMock
from queue import Queue

from qualibrate.qualibration_graph import QualibrationGraph
from qualibrate.models.node_status import NodeStatus
from qualibrate.orchestration.basic_orchestrator import BasicOrchestrator


class TestBasicOrchestrator:

    def test_is_execution_finished_graph_is_none(self):
        orchestrator = BasicOrchestrator()
        orchestrator._graph = None  # Simulate no graph being set
        assert orchestrator._is_execution_finished() is True

    def test_is_execution_finished_empty_queue(self, mocker):
        orchestrator = BasicOrchestrator()

        # Mock _graph and queue size
        mock_graph = mocker.patch.object(orchestrator, '_graph', create=True)
        mocker.patch.object(orchestrator._execution_queue, 'qsize', return_value=0)

        assert orchestrator._is_execution_finished() is True

    def test_is_execution_finished_with_pending_nodes(self, mocker):
        orchestrator = BasicOrchestrator()
        orchestrator._graph = mocker.Mock()
        # Mock the nx_graph property
        mocker.patch(
            'qualibrate.orchestration.basic_orchestrator.BasicOrchestrator.nx_graph',
            new_callable=PropertyMock
        )
        # Mock pending node statuses
        mock_status = {'node_1': NodeStatus.pending, 'node_2': NodeStatus.successful}
        mocker.patch('networkx.get_node_attributes', return_value=mock_status)
        mocker.patch.object(orchestrator._execution_queue, 'qsize', return_value=1)

        assert orchestrator._is_execution_finished() is False

    def test_cleanup_clears_queue(self):
        orchestrator = BasicOrchestrator()
        orchestrator._graph = "graph"
        orchestrator._is_stopped = True
        orchestrator.targets = orchestrator.initial_targets = ["q1"]
        orchestrator._execution_queue.put('test_node')
        orchestrator.cleanup()
        assert orchestrator._graph is None
        assert orchestrator._is_stopped is False
        assert orchestrator.initial_targets is None
        assert orchestrator.targets is None
        assert orchestrator._execution_history == []
        assert orchestrator._active_node is None
        assert orchestrator.final_outcomes == {}
        assert orchestrator._execution_queue.empty()

    def test_nx_graph_raises_error_if_no_graph(self):
        orchestrator = BasicOrchestrator()
        orchestrator._graph = None
        with pytest.raises(ValueError, match="Graph is not specified"):
            orchestrator.nx_graph

    def test_nx_graph_returns_correct_value(self, mocker):
        orchestrator = BasicOrchestrator()

        # Mock the _graph object
        mock_graph = mocker.patch.object(orchestrator, '_graph', create=True)
        mocker.patch.object(mock_graph, '_graph', create=True)

        assert orchestrator.nx_graph == mock_graph._graph

    def test_check_node_successful_without_graph(self):
        orchestrator = BasicOrchestrator()
        orchestrator._graph = None
        mock_node = MagicMock()
        assert orchestrator.check_node_successful(mock_node) is False

    def test_check_node_successful_with_successful_node(self, mocker):
        orchestrator = BasicOrchestrator()
        orchestrator._graph = "graph"
        mock_nx_graph = mocker.patch(
            'qualibrate.orchestration.basic_orchestrator.BasicOrchestrator.nx_graph',
            new_callable=PropertyMock
        )
        mock_node = MagicMock()
        mock_nx_graph.return_value.nodes = {
            mock_node: {QualibrationGraph.STATUS_FIELD: NodeStatus.successful}
        }
        assert orchestrator.check_node_successful(mock_node) is True

    def test_get_next_node_with_empty_queue(self):
        orchestrator = BasicOrchestrator()
        orchestrator._execution_queue = Queue()  # Empty queue
        assert orchestrator.get_next_node() is None

    def test_get_next_node_returns_node(self, mocker):
        orchestrator = BasicOrchestrator()
        mock_node = MagicMock()

        # Add mock node to the queue
        orchestrator._execution_queue.put(mock_node)

        # Patch the nx_graph property and set predecessors
        mock_nx_graph = mocker.patch(
            'qualibrate.orchestration.basic_orchestrator.BasicOrchestrator.nx_graph',
            new_callable=PropertyMock
        )
        mock_nx_graph.return_value.pred = {mock_node: []}

        # Mock check_node_successful to always return True
        mocker.patch.object(orchestrator, 'check_node_successful', return_value=True)

        assert orchestrator.get_next_node() == mock_node

    def test_traverse_graph_logs_info(self, mocker):
        mock_logger = mocker.patch('qualibrate.orchestration.basic_orchestrator.logger')
        orchestrator = BasicOrchestrator()
        mock_graph = MagicMock()
        mock_graph.name = "test_graph"
        targets = ["target_1"]

        # Call the method and check logger
        orchestrator.traverse_graph(mock_graph, targets)
        mock_logger.info.assert_called_with(f"Traverse graph {mock_graph.name} with targets {targets}")

    def test_traverse_graph_raises_error_if_no_parameters(self):
        orchestrator = BasicOrchestrator()
        mock_graph = MagicMock()
        mock_graph.full_parameters = None

        with pytest.raises(RuntimeError, match="Execution graph parameters not specified"):
            orchestrator.traverse_graph(mock_graph, [])

