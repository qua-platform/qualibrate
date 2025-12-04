import itertools
from datetime import datetime
from unittest.mock import MagicMock

import networkx as nx
import pytest

from qualibrate import QualibrationGraph, QualibrationNode
from qualibrate.models.node_status import ElementRunStatus
from qualibrate.models.outcome import Outcome
from qualibrate.models.run_mode import RunModes
from qualibrate.parameters import GraphParameters
from qualibrate.q_runnnable import QRunnable
from qualibrate.utils.exceptions import CyclicGraphError, StopInspection


class TestQualibrationGraph:
    @pytest.fixture
    def mock_logger(self, mocker):
        return mocker.patch("qualibrate.qualibration_graph.logger")

    @pytest.fixture
    def mock_library(self, mocker):
        """Mock the QualibrationLibrary to avoid initialization issues"""
        mock_lib = mocker.MagicMock()
        mock_lib.nodes.values_nocopy.return_value = {}  # Empty library
        mocker.patch.object(
            QualibrationGraph,
            "_get_library",
            return_value=mock_lib,
        )
        return mock_lib

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
    def mocked__validate_no_elements_from_library(self, mocker):
        return mocker.patch(
            "qualibrate.qualibration_graph.QualibrationGraph"
            "._validate_no_elements_from_library"
        )

    @pytest.fixture
    def pre_setup_graph_parameters_build(
        self, mocker, mocked__validate_no_elements_from_library
    ):
        mocked_build_base_parameters = mocker.patch.object(
            QRunnable, "build_parameters_class_from_instance"
        )
        mocked_build_full_parameters = mocker.patch(
            "qualibrate.qualibration_graph.QualibrationGraph"
            "._build_parameters_class"
        )
        return (
            mocked_build_base_parameters,
            mocked_build_full_parameters,
            mocked__validate_no_elements_from_library,
        )

    @pytest.fixture
    def pre_setup_graph_init(
        self, mocker, pre_setup_graph_nodes, pre_setup_graph_parameters_build
    ):
        mocked_add_nodes_and_connections = mocker.patch(
            "qualibrate.qualibration_graph.QualibrationGraph."
            "_add_nodes_and_connections_to_nx",
        )
        (
            mocked_build_base_parameters,
            mocked_build_full_parameters,
            mocked__validate_no_elements_from_library,
        ) = pre_setup_graph_parameters_build

        return (
            pre_setup_graph_nodes,
            mocked_add_nodes_and_connections,
            mocked_build_base_parameters,
            mocked_build_full_parameters,
        )

    def test_init_graph_base(
        self,
        mocker,
        pre_setup_graph_init,
        mocked__validate_no_elements_from_library,
    ):
        (
            nodes,
            mocked_validate_nodes_and_connections,
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
        assert graph._elements == nodes
        assert list(graph._connectivity.keys()) == connectivity
        assert all(
            outcome == Outcome.SUCCESSFUL
            for outcome in graph._connectivity.values()
        )
        assert graph.name == "test_graph"
        mocked_build_base_parameters.assert_called_once()
        mocked_build_full_parameters.assert_called_once()
        mocked__validate_no_elements_from_library.assert_called_once()
        mocked_validate_nodes_and_connections.assert_called_once()

    def test__add_nodes_and_connections(
        self, mocker, pre_setup_graph_parameters_build
    ):
        nodes = {}
        for node_name in ["node1", "node2", "node3"]:
            node = MagicMock(QualibrationNode)
            node.name = node_name
            nodes[node_name] = node

        mocked_add_node_by_name = mocker.patch(
            "qualibrate.qualibration_graph.QualibrationGraph"
            "._add_element_to_nx_by_name",
        )
        mocked_get_qnode_or_error = mocker.patch(
            "qualibrate.qualibration_graph.QualibrationGraph"
            "._get_element_or_error"
        )
        mocked_validate_graph_acyclic = mocker.patch(
            "qualibrate.qualibration_graph.QualibrationGraph."
            "_validate_graph_acyclic",
        )

        connectivity = [
            ("node1", "node2"),
            ("node2", "node3"),
            ("node1", "node3"),
        ]
        mocker.patch("networkx.DiGraph")
        QualibrationGraph(
            name="test_graph",
            parameters=MagicMock(spec=GraphParameters),
            nodes=nodes,
            connectivity=connectivity,
        )

        mocked_add_node_by_name.assert_has_calls(
            [mocker.call(name) for name in nodes]
        )
        mocked_get_qnode_or_error.assert_has_calls(
            itertools.chain.from_iterable(
                [mocker.call(x), mocker.call(v)] for x, v in connectivity
            )
        )
        mocked_validate_graph_acyclic.assert_called_once()

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

    def test_validate_elements_names_mapping_no_conflicts(
        self, pre_setup_graph_nodes
    ):
        nodes = pre_setup_graph_nodes

        result = QualibrationGraph._validate_elements_names_mapping(nodes)

        assert result == nodes

    def test_validate_elements_names_mapping_with_conflicting_name(
        self, mock_logger, pre_setup_graph_nodes
    ):
        nodes = pre_setup_graph_nodes
        node = nodes.pop("node1")
        nodes["new_name"] = node
        node.copy.return_value = "copied_instance"

        result = QualibrationGraph._validate_elements_names_mapping(nodes)

        assert result["new_name"] == "copied_instance"
        node.copy.assert_called_once_with("new_name")
        mock_logger.warning.assert_called_once_with(
            "copied_instance has to be copied due to conflicting name "
            "(new_name)"
        )

    def test_add_element_to_nx_by_name(
        self, mocker, pre_setup_graph_nodes, pre_setup_graph_parameters_build
    ):
        node = pre_setup_graph_nodes["node1"]
        mocked_validate_names = mocker.patch.object(
            QualibrationGraph,
            "_validate_elements_names_mapping",
            return_value={},
        )
        mock_get_qnode = mocker.patch.object(
            QualibrationGraph, "_get_element_or_error", return_value=node
        )
        graph = QualibrationGraph(
            name="test_graph",
            parameters=MagicMock(spec=GraphParameters),
            nodes={},
            connectivity=[],
        )
        mocked_add_node = mocker.patch.object(graph._graph, "add_node")
        graph._add_element_to_nx_by_name("node1")
        mocked_validate_names.assert_called_once()
        mock_get_qnode.assert_called_once_with("node1")
        mocked_add_node.asser_called_once_with(
            node,
            retries=0,
            **{
                QualibrationGraph.ELEMENT_STATUS_FIELD: ElementRunStatus.pending
            },
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
                "node1": ElementRunStatus.finished,
                "node2": ElementRunStatus.pending,
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

    def test_connect_adds_edge_with_successful_outcome(
        self, pre_setup_graph_init, mock_library
    ):
        """Test that connect() adds edge with SUCCESSFUL outcome"""
        (nodes, _, _, _) = pre_setup_graph_init

        with QualibrationGraph.build(
            name="test_graph",
            parameters=GraphParameters(),
        ) as graph:
            graph.add_nodes(nodes["node1"], nodes["node2"])
            graph.connect("node1", "node2")

        # Check connectivity was added with SUCCESSFUL outcome
        assert ("node1", "node2") in graph._connectivity
        assert graph._connectivity[("node1", "node2")] == Outcome.SUCCESSFUL

    def test_connect_on_failure_adds_edge_with_failed_outcome(
        self, pre_setup_graph_init, mock_library
    ):
        """Test that connect_on_failure() adds edge with FAILED outcome"""
        (nodes, _, _, _) = pre_setup_graph_init

        with QualibrationGraph.build(
            name="test_graph",
            parameters=GraphParameters(),
        ) as graph:
            graph.add_nodes(nodes["node1"], nodes["node2"])
            graph.connect_on_failure("node1", "node2")

        # Check connectivity was added with FAILED outcome
        assert ("node1", "node2") in graph._connectivity
        assert graph._connectivity[("node1", "node2")] == Outcome.FAILED

    def test_connect_with_node_objects(
        self, pre_setup_graph_init, mock_library
    ):
        """Test that connect() works with node objects (not just strings)"""
        (nodes, _, _, _) = pre_setup_graph_init
        node1 = nodes["node1"]
        node2 = nodes["node2"]

        with QualibrationGraph.build(
            name="test_graph",
            parameters=MagicMock(spec=GraphParameters),
        ) as graph:
            graph.add_nodes(node1, node2)
            graph.connect(node1, node2)

        assert ("node1", "node2") in graph._connectivity
        assert graph._connectivity[("node1", "node2")] == Outcome.SUCCESSFUL

    def test_connect_on_failure_with_node_objects(
        self, pre_setup_graph_init, mock_library
    ):
        """Test that connect_on_failure() works with node objects"""
        (nodes, _, _, _) = pre_setup_graph_init
        node1 = nodes["node1"]
        node2 = nodes["node2"]

        with QualibrationGraph.build(
            name="test_graph",
            parameters=GraphParameters(),
        ) as graph:
            graph.add_nodes(node1, node2)
            graph.connect_on_failure(node1, node2)

        assert ("node1", "node2") in graph._connectivity
        assert graph._connectivity[("node1", "node2")] == Outcome.FAILED

    def test_connect_raises_error_if_source_not_added(
        self, pre_setup_graph_nodes, mock_library
    ):
        """Test that connect() raises KeyError if source node not added"""
        nodes = pre_setup_graph_nodes

        with (
            pytest.raises(
                KeyError, match="Both 'node1' and 'node2' must be added"
            ),
            QualibrationGraph.build(
                name="test_graph",
                parameters=GraphParameters(),
            ) as graph,
        ):
            # Only add node2, not node1
            graph.add_node(nodes["node2"])
            graph.connect("node1", "node2")

    def test_connect_raises_error_if_destination_not_added(
        self, pre_setup_graph_nodes, mock_library
    ):
        """Test that connect() raises KeyError if destination node not added"""
        nodes = pre_setup_graph_nodes

        with (
            pytest.raises(
                KeyError, match="Both 'node1' and 'node2' must be added"
            ),
            QualibrationGraph.build(
                name="test_graph",
                parameters=GraphParameters(),
            ) as graph,
        ):
            # Only add node1, not node2
            graph.add_node(nodes["node1"])
            graph.connect("node1", "node2")

    def test_connect_idempotent(self, pre_setup_graph_init, mock_library):
        """Test that calling connect() multiple
        times on same edge is idempotent"""
        (nodes, _, _, _) = pre_setup_graph_init

        with QualibrationGraph.build(
            name="test_graph",
            parameters=GraphParameters(),
        ) as graph:
            graph.add_nodes(nodes["node1"], nodes["node2"])
            graph.connect("node1", "node2")
            graph.connect("node1", "node2")  # Call again

        # Should still only have one edge
        assert len(graph._connectivity) == 1
        assert graph._connectivity[("node1", "node2")] == Outcome.SUCCESSFUL

    def test_mixed_connect_and_connect_on_failure(
        self, pre_setup_graph_init, mock_library
    ):
        """Test using both connect() and connect_on_failure() in same graph"""
        (nodes, _, _, _) = pre_setup_graph_init
        node1 = nodes["node1"]
        node2 = nodes["node2"]

        # Create a third node for this test
        node3 = MagicMock(QualibrationNode)
        node3.name = "node3"

        with QualibrationGraph.build(
            name="test_graph",
            parameters=GraphParameters(),
        ) as graph:
            graph.add_nodes(node1, node2, node3)
            graph.connect("node1", "node2")  # Success path
            graph.connect_on_failure("node1", "node3")  # Failure path

        # Check both edges exist with correct outcomes
        assert len(graph._connectivity) == 2
        assert graph._connectivity[("node1", "node2")] == Outcome.SUCCESSFUL
        assert graph._connectivity[("node1", "node3")] == Outcome.FAILED

    def test_build_context_manager_finalization(
        self, pre_setup_graph_init, mock_library
    ):
        """Test that build() context manager properly finalizes graph"""
        (nodes, _, _, _) = pre_setup_graph_init

        # Before entering context, graph should not be finalized
        graph = QualibrationGraph.build(
            name="test_graph",
            parameters=GraphParameters(),
        )
        assert graph._finalized is False

        # After exiting context, graph should be finalized
        with graph:
            graph.add_nodes(nodes["node1"], nodes["node2"])
            graph.connect("node1", "node2")

        assert graph._finalized is True

    def test_build_sets_building_flag(self, pre_setup_graph_init, mock_library):
        """Test that _building flag is set correctly during build"""
        (nodes, _, _, _) = pre_setup_graph_init

        graph = QualibrationGraph.build(
            name="test_graph",
            parameters=GraphParameters(),
        )

        # Before entering context
        assert graph._building is False

        with graph:
            # Inside context
            assert graph._building is True
            graph.add_nodes(nodes["node1"], nodes["node2"])

        # After exiting context
        assert graph._building is False

    def test_connect_enforces_building_state(
        self, pre_setup_graph_init, mock_library
    ):
        """Test that connect() requires graph to be in building state"""
        (nodes, _, _, _) = pre_setup_graph_init

        # Create finalized graph
        graph = QualibrationGraph(
            name="test_graph",
            parameters=GraphParameters(),
            nodes=nodes,
            connectivity=[],
        )

        # Should not be able to connect after finalization
        with pytest.raises(RuntimeError):
            graph.connect("node1", "node2")

    def test_connect_on_failure_enforces_building_state(
        self, pre_setup_graph_init, mock_library
    ):
        """Test that connect_on_failure() requires
        graph to be in building state"""
        (nodes, _, _, _) = pre_setup_graph_init

        # Create finalized graph
        graph = QualibrationGraph(
            name="test_graph",
            parameters=GraphParameters(),
            nodes=nodes,
            connectivity=[],
        )

        # Should not be able to connect after finalization
        with pytest.raises(RuntimeError):
            graph.connect_on_failure("node1", "node2")

    def test__validate_graph_acyclic_with_cycle(
        self, mock_orchestrator, pre_setup_graph_init
    ):
        (nodes, _, _, _) = pre_setup_graph_init
        node1, node2 = nodes["node1"], nodes["node2"]
        nx_g = nx.DiGraph()
        nx_g.add_nodes_from([node1, node2])
        nx_g.add_edge(node1, node2)
        nx_g.add_edge(node2, node1)
        graph = QualibrationGraph(
            name="test_graph",
            parameters=MagicMock(spec=GraphParameters),
            nodes=nodes,
            connectivity=[("node1", "node2"), ("node2", "node1")],
        )
        graph._graph = nx_g
        with pytest.raises(CyclicGraphError) as ex:
            graph._validate_graph_acyclic()

        ex_str = str(ex)
        assert "test_graph" in ex_str
        assert ex_str.count("node1") == 2
        assert ex_str.count("node2") == 1

    def test__validate_graph_acyclic_without_cycle(
        self, mock_orchestrator, pre_setup_graph_init
    ):
        (nodes, _, _, _) = pre_setup_graph_init
        for node_name in ["node3", "node4"]:
            node = MagicMock(QualibrationNode)
            node.name = node_name
            nodes[node_name] = node
        connectivity = [
            ("node1", "node2"),
            ("node2", "node3"),
            ("node3", "node4"),
            ("node1", "node3"),
            ("node1", "node4"),
        ]
        graph = QualibrationGraph(
            name="test_graph",
            parameters=MagicMock(spec=GraphParameters),
            nodes=nodes,
            connectivity=connectivity,
            orchestrator=mock_orchestrator,
        )
        graph._validate_graph_acyclic()

    # @pytest.mark.skip
    # def test_connect_then_connect_on_failure_same_edge_overwrites(
    #     self, pre_setup_graph_init, mock_library
    # ):
    #     """Test that calling connect() then connect_on_failure()
    #     on the same edge overwrites to FAILED scenario"""
    #     (nodes, _, _, _) = pre_setup_graph_init
    #
    #     with QualibrationGraph.build(
    #         name="test_graph",
    #         parameters=GraphParameters(),
    #     ) as graph:
    #         graph.add_nodes(nodes["node1"], nodes["node2"])
    #         graph.connect("node1", "node2")  # First: SUCCESS
    #         graph.connect_on_failure("node1", "node2")  # Then: FAILED
    #
    #     # Should only have one edge with FAILED outcome (last write wins)
    #     assert len(graph._connectivity) == 1
    #     assert graph._connectivity[("node1", "node2")] == Outcome.FAILED
