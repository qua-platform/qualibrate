from unittest.mock import MagicMock

import pytest

from qualibrate import QualibrationNode, QualibrationGraph
from qualibrate.q_runnnable import QRunnable


@pytest.fixture
def mock_logger( mocker):
    return mocker.patch("qualibrate.qualibration_graph.logger")


@pytest.fixture
def mock_library( mocker):
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
def mock_orchestrator( mocker):
    return mocker.patch(
        "qualibrate.orchestration.basic_orchestrator.QualibrationOrchestrator"
    )


@pytest.fixture
def pre_setup_graph_nodes():
    node1 = MagicMock(QualibrationNode)
    node1.name = "node1"
    node2 = MagicMock(QualibrationNode)
    node2.name = "node2"
    return {"node1": node1, "node2": node2}


@pytest.fixture
def mocked__validate_no_elements_from_library( mocker):
    return mocker.patch(
        "qualibrate.qualibration_graph.QualibrationGraph"
        "._validate_no_elements_from_library"
    )


@pytest.fixture
def pre_setup_graph_parameters_build(
        mocker, mocked__validate_no_elements_from_library
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
        mocker, pre_setup_graph_nodes, pre_setup_graph_parameters_build
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