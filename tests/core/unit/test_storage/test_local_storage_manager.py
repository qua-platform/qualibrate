from datetime import datetime
from pathlib import Path
from unittest.mock import MagicMock, call

import pytest
from pydantic import BaseModel
from qualang_tools.results import DataHandler

from qualibrate.core.models.outcome import Outcome
from qualibrate.core.storage.local_storage_manager import LocalStorageManager, logger


class Parameters(BaseModel):
    int_val: int = 1


class DummyNode:
    def __init__(
        self,
        name="test_node",
        parameters=None,
        machine=None,
        results=None,
        outcomes=None,
        description=None,
    ):
        self.name = name
        self.description = description
        self.machine = machine
        self.results = results or {"result": 42}
        self.run_start = datetime.now().astimezone()
        self.parameters = parameters or Parameters()
        self.outcomes = outcomes or {}


@pytest.fixture
def data_handler_path(tmp_path):
    yield tmp_path / "data_handler"


@pytest.fixture
def mock_data_handler(mocker, data_handler_path):
    data_handler = mocker.patch(
        "qualibrate.core.storage.local_storage_manager.DataHandler",
        spec=DataHandler,
    )
    data_handler.return_value.path = data_handler_path
    yield data_handler


@pytest.fixture
def mock_generate(mock_data_handler):
    generate = mock_data_handler.return_value.generate_node_contents
    generate.return_value = {"id": 123}
    yield generate


@pytest.fixture
def local_manager_root(mocker):
    root_folder = Path("/tmp/test_folder")
    manager = LocalStorageManager(root_folder)
    mocker.patch.object(manager, "_clean_data_handler")
    yield manager


def test_initialization():
    root_folder = Path("/tmp/test_folder")
    active_path = Path("/tmp/active_machine")
    manager = LocalStorageManager(root_folder, active_path)
    assert manager.root_data_folder == root_folder
    assert manager.active_machine_path == active_path
    assert manager.snapshot_idx is None


def test_save_node_without_machine(mocker, mock_data_handler, mock_generate, local_manager_root):
    node = DummyNode()
    mock_logger = mocker.patch.object(logger, "info")

    local_manager_root.save(node)

    mock_logger.assert_any_call("Saving node test_node to local storage")
    assert mock_data_handler.return_value.node_data == {
        "parameters": {
            "model": node.parameters.model_dump(mode="json"),
            "schema": node.parameters.__class__.model_json_schema(),
        },
        "outcomes": {},
    }
    mock_data_handler.return_value.save_data.assert_called_once_with(
        data=node.results,
        name=node.name,
        node_contents=mock_generate.return_value,
    )
    assert local_manager_root.snapshot_idx == mock_generate.return_value["id"]


def test_save_node_with_machine_object_no_act_m_path(
    data_handler_path, mock_data_handler, mock_generate, local_manager_root
):
    machine = MagicMock()
    node = DummyNode(machine=machine)

    local_manager_root.save(node)

    assert local_manager_root.snapshot_idx == mock_generate.return_value["id"]
    machine.save.assert_called_once()


@pytest.mark.parametrize(
    "outcomes",
    [
        {"q1": Outcome.SUCCESSFUL, "q2": Outcome.FAILED},
        {"q1": Outcome.SUCCESSFUL.value, "q2": Outcome.FAILED.value},
    ],
)
def test_save_node_outcomes(mocker, mock_data_handler, mock_generate, local_manager_root, outcomes):
    node = DummyNode(outcomes=outcomes)
    mock_logger = mocker.patch.object(logger, "info")

    local_manager_root.save(node)

    mock_logger.assert_any_call("Saving node test_node to local storage")
    assert local_manager_root.snapshot_idx == mock_generate.return_value["id"]
    assert mock_data_handler.return_value.node_data == {
        "parameters": {
            "model": node.parameters.model_dump(mode="json"),
            "schema": node.parameters.__class__.model_json_schema(),
        },
        "outcomes": {
            "q1": Outcome.SUCCESSFUL.value,
            "q2": Outcome.FAILED.value,
        },
    }
    mock_data_handler.return_value.save_data.assert_called_once_with(
        data=node.results,
        name=node.name,
        node_contents=mock_generate.return_value,
    )


def test_save_active_machine_path(mocker, mock_generate, mock_data_handler):
    root_folder = Path("/tmp/test_folder")
    active_path = Path("/tmp/active_machine")
    manager = LocalStorageManager(root_folder, active_path)
    mocker.patch.object(manager, "_clean_data_handler")

    machine = MagicMock()
    node = DummyNode(machine=machine)

    manager.save(node)

    assert manager.data_handler.path is not None
    machine.save.assert_has_calls(
        [
            call(active_path),
            call(Path(manager.data_handler.path) / "quam_state"),
        ]
    )
    assert manager.snapshot_idx == mock_generate.return_value["id"]
