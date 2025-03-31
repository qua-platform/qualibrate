from datetime import datetime
from unittest.mock import MagicMock

import pytest

from qualibrate import QualibrationGraph, QualibrationNode
from qualibrate.models.node_status import NodeStatus
from qualibrate.models.run_mode import RunModes
from qualibrate.parameters import GraphParameters
from qualibrate.q_runnnable import QRunnable
from qualibrate.utils.exceptions import StopInspection


class TestQualibrationGraph:
    @pytest.fixture
    def mock_logger(self, mocker):
        return mocker.patch("qualibrate.qualibration_graph.logger")

    @pytest.fixture
    def mock_orchestrator(self, mocker):
        return mocker.patch(
            "qualibrate.orchestration.basic_orchestrator.QualibrationOrchestrator"
        )

    @pytest.fixture
    def pre_setup_graph_nodes(self):
        node1 = MagicMock(QualibrationNode)
        node1.name = "node1"
        node2 = MagicMock(QualibrationNode)
        node2.name = "node2"
        return {"node1": node1, "node2": node2}

    @pytest.fixture
    def pre_setup_graph_parameters_build(self, mocker):
        mocked_build_base_parameters = mocker.patch.object(
            QRunnable, "build_parameters_class_from_instance"
        )
        mocked_build_full_parameters = mocker.patch(
            "qualibrate.qualibration_graph.QualibrationGraph"
            "._build_parameters_class"
        )
        return mocked_build_base_parameters, mocked_build_full_parameters

    @pytest.fixture
    def pre_setup_graph_init(
        self, mocker, pre_setup_graph_nodes, pre_setup_graph_parameters_build
    ):
        mocked_add_node = mocker.patch(
            "qualibrate.qualibration_graph.QualibrationGraph._add_node_by_name",
            side_effect=lambda x: x,
        )
        mocked_build_base_parameters, mocked_build_full_parameters = (
            pre_setup_graph_parameters_build
        )

        return (
            pre_setup_graph_nodes,
            mocked_add_node,
            mocked_build_base_parameters,
            mocked_build_full_parameters,
        )

    def test_init_graph_base(self, mocker, pre_setup_graph_init):
        (
            nodes,
            mocked_add_node,
            mocked_build_base_parameters,
            mocked_build_full_parameters,
        ) = pre_setup_graph_init
        connectivity = [("node1", "node2")]
        mock_nx_graph = MagicMock()
        mock_nx_graph.has_edge.return_value = False
        mocker.patch(
            "qualibrate.qualibration_graph.nx.DiGraph",
            return_value=mock_nx_graph,
        )
        graph = QualibrationGraph(
            name="test_graph",
            parameters=MagicMock(spec=GraphParameters),
            nodes=nodes,
            connectivity=connectivity,
        )
        assert graph._nodes == nodes
        assert graph._connectivity == connectivity
        assert graph.name == "test_graph"
        mocked_build_base_parameters.assert_called_once()
        mocked_build_full_parameters.assert_called_once()
        mocked_add_node.assert_has_calls(
            [mocker.call("node1"), mocker.call("node2")], any_order=True
        )
        mock_nx_graph.add_edge.assert_called_once_with(
            nodes["node1"], nodes["node2"]
        )

    def test_init_graph_with_inspection_mode(self, pre_setup_graph_init):
        (nodes, _, _, _) = pre_setup_graph_init
        connectivity = [("node1", "node2")]

        with pytest.raises(
            StopInspection, match="Graph instantiated in inspection mode"
        ) as ex:
            QualibrationGraph(
                name="test_graph",
                parameters=MagicMock(spec=GraphParameters),
                nodes=nodes,
                connectivity=connectivity,
                modes=RunModes(inspection=True),
            )
        assert isinstance(ex.value.instance, QualibrationGraph)
        assert ex.value.instance.name == "test_graph"

    def test_validate_nodes_names_mapping_no_conflicts(
        self, pre_setup_graph_nodes
    ):
        nodes = pre_setup_graph_nodes

        result = QualibrationGraph._validate_nodes_names_mapping(nodes)

        assert result == nodes

    def test_validate_nodes_names_mapping_with_conflicting_name(
        self, mock_logger, pre_setup_graph_nodes
    ):
        nodes = pre_setup_graph_nodes
        node = nodes.pop("node1")
        nodes["new_name"] = node
        node.copy.return_value = "copied_instance"

        result = QualibrationGraph._validate_nodes_names_mapping(nodes)

        assert result["new_name"] == "copied_instance"
        node.copy.assert_called_once_with("new_name")
        mock_logger.warning.assert_called_once_with(
            "copied_instance has to be copied due to conflicting name "
            "(new_name)"
        )

    def test_add_node_by_name(
        self, mocker, pre_setup_graph_nodes, pre_setup_graph_parameters_build
    ):
        node = pre_setup_graph_nodes["node1"]
        mocked_validate_names = mocker.patch.object(
            QualibrationGraph, "_validate_nodes_names_mapping", return_value={}
        )
        mock_get_qnode = mocker.patch.object(
            QualibrationGraph, "_get_qnode_or_error", return_value=node
        )
        graph = QualibrationGraph(
            name="test_graph",
            parameters=MagicMock(spec=GraphParameters),
            nodes={},
            connectivity=[],
        )
        mocked_add_node = mocker.patch.object(graph._graph, "add_node")
        graph._add_node_by_name("node1")
        mocked_validate_names.assert_called_once()
        mock_get_qnode.assert_called_once_with("node1")
        mocked_add_node.asser_called_once_with(
            node,
            retries=0,
            **{QualibrationGraph.STATUS_FIELD: NodeStatus.pending},
        )

    def test_cleanup(self, mocker, mock_orchestrator, pre_setup_graph_init):
        (nodes, _, _, _) = pre_setup_graph_init
        connectivity = [("node1", "node2")]
        graph = QualibrationGraph(
            name="test_graph",
            parameters=MagicMock(spec=GraphParameters),
            nodes=nodes,
            connectivity=connectivity,
            orchestrator=mock_orchestrator,
        )
        mock_nx_set_node_attributes = mocker.patch(
            "qualibrate.qualibration_graph.nx.set_node_attributes"
        )

        graph.cleanup()

        mock_nx_set_node_attributes.assert_called_once()
        mock_orchestrator.cleanup.assert_called_once()

    def test_completed_count(self, mocker, pre_setup_graph_init):
        (nodes, _, _, _) = pre_setup_graph_init
        connectivity = [("node1", "node2")]

        mock_get_node_attributes = mocker.patch(
            "qualibrate.qualibration_graph.nx.get_node_attributes",
            return_value={
                "node1": NodeStatus.finished,
                "node2": NodeStatus.pending,
            },
        )

        graph = QualibrationGraph(
            name="test_graph",
            parameters=MagicMock(spec=GraphParameters),
            nodes=nodes,
            connectivity=connectivity,
        )

        count = graph.completed_count()

        mock_get_node_attributes.assert_called_once()
        assert count == 1

    def test_run_successful(self, mocker, pre_setup_graph_init):
        (nodes, _, _, _) = pre_setup_graph_init
        connectivity = [("node1", "node2")]
        orchestrator = MagicMock()

        graph = QualibrationGraph(
            name="test_graph",
            parameters=MagicMock(spec=GraphParameters),
            nodes=nodes,
            connectivity=connectivity,
            orchestrator=orchestrator,
        )

        # Mock datetime
        mock_datetime = mocker.patch("qualibrate.qualibration_graph.datetime")
        mock_datetime.now.return_value = datetime(2020, 1, 1)

        # Mock orchestrator.traverse_graph
        mock_orchestrator_traverse = mocker.patch.object(
            orchestrator, "traverse_graph"
        )

        # Mock _post_run
        mock_post_run = mocker.patch.object(
            graph, "_post_run", return_value="run_summary"
        )

        run_summary = graph.run(nodes={"node1": {}})

        mock_orchestrator_traverse.assert_called_once()
        mock_post_run.assert_called_once()
        assert run_summary == "run_summary"

    def test_run_error(self, mocker, pre_setup_graph_init):
        (nodes, _, _, _) = pre_setup_graph_init
        connectivity = [("node1", "node2")]
        orchestrator = MagicMock()

        graph = QualibrationGraph(
            name="test_graph",
            parameters=MagicMock(spec=GraphParameters),
            nodes=nodes,
            connectivity=connectivity,
            orchestrator=orchestrator,
        )
        mocker.patch.object(
            orchestrator, "traverse_graph", side_effect=Exception("Test error")
        )
        mock_post_run = mocker.patch.object(
            graph, "_post_run", return_value="run_summary"
        )

        with pytest.raises(Exception, match="Test error"):
            graph.run(nodes={"node1": {}})

        mock_post_run.assert_called_once()
        call_args = mock_post_run.call_args_list[0][0]
        assert call_args[1].error_class == "Exception"
        assert call_args[1].message == "Test error"

    def test_stop(self, pre_setup_graph_init):
        (nodes, _, _, _) = pre_setup_graph_init
        connectivity = [("node1", "node2")]
        orchestrator = MagicMock()

        graph = QualibrationGraph(
            name="test_graph",
            parameters=MagicMock(spec=GraphParameters),
            nodes=nodes,
            connectivity=connectivity,
            orchestrator=orchestrator,
        )

        # Mock orchestrator's stop and active_node.stop()
        orchestrator.active_node = MagicMock()
        orchestrator.active_node.stop.return_value = True

        result = graph.stop(stop_graph_node=True)

        orchestrator.active_node.stop.assert_called_once()
        orchestrator.stop.assert_called_once()
        assert result is True

    def test_stop_without_active_node(self, pre_setup_graph_init):
        (nodes, _, _, _) = pre_setup_graph_init
        connectivity = [("node1", "node2")]
        orchestrator = MagicMock()

        graph = QualibrationGraph(
            name="test_graph",
            parameters=MagicMock(spec=GraphParameters),
            nodes=nodes,
            connectivity=connectivity,
            orchestrator=orchestrator,
        )

        orchestrator.active_node = None

        result = graph.stop(stop_graph_node=True)

        orchestrator.stop.assert_called_once()
        assert result is True
