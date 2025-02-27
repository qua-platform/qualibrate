import json
from datetime import datetime
from pathlib import Path
from unittest.mock import MagicMock, call

import pytest
from pydantic import BaseModel

from qualibrate.models.outcome import Outcome
from qualibrate.storage.local_storage_manager import LocalStorageManager


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
    ):
        self.name = name
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
        "qualibrate.storage.local_storage_manager.DataHandler"
    )
    data_handler.return_value.path = data_handler_path
    yield data_handler


@pytest.fixture
def mock_generate(mock_data_handler):
    generate = mock_data_handler.return_value.generate_node_contents
    generate.return_value = {"id": 123}
    yield generate


@pytest.fixture
def local_manager_root():
    root_folder = Path("/tmp/test_folder")
    yield LocalStorageManager(root_folder)


def test_initialization():
    root_folder = Path("/tmp/test_folder")
    active_path = Path("/tmp/active_machine")
    manager = LocalStorageManager(root_folder, active_path)
    assert manager.root_data_folder == root_folder
    assert manager.active_machine_path == active_path
    assert manager.snapshot_idx is None


def test_save_node_without_machine(
    mocker, mock_data_handler, mock_generate, local_manager_root
):
    node = DummyNode()
    mock_logger = mocker.patch("qualibrate.utils.logger_m.logger.info")

    local_manager_root.save(node)

    mock_logger.assert_any_call("Saving node test_node to local storage")
    assert mock_data_handler.return_value.node_data == {
        "quam": "./quam_state.json",
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


def test_save_node_with_dict_machine(mocker, mock_generate, local_manager_root):
    dummy_machine = {"key": "value"}
    node = DummyNode(machine=dummy_machine)
    spy_write = mocker.patch("pathlib.Path.write_text")

    local_manager_root.save(node)

    spy_write.assert_called_once_with(
        json.dumps(dummy_machine, indent=4, sort_keys=True)
    )
    assert local_manager_root.snapshot_idx == mock_generate.return_value["id"]


def test_save_node_with_machine_object_no_act_m_path(
    data_handler_path, mock_data_handler, mock_generate, local_manager_root
):
    machine = MagicMock()
    node = DummyNode(machine=machine)

    local_manager_root.save(node)

    assert local_manager_root.snapshot_idx == mock_generate.return_value["id"]
    machine.save.assert_has_calls(
        [
            call(path=data_handler_path / "quam_state.json"),
            call(
                path=(data_handler_path / "quam_state"),
                content_mapping=LocalStorageManager.machine_content_mapping,
            ),
        ]
    )


@pytest.mark.parametrize(
    "outcomes",
    [
        {"q1": Outcome.SUCCESSFUL, "q2": Outcome.FAILED},
        {"q1": Outcome.SUCCESSFUL.value, "q2": Outcome.FAILED.value},
    ],
)
def test_save_node_outcomes(
    mocker, mock_data_handler, mock_generate, local_manager_root, outcomes
):
    node = DummyNode(outcomes=outcomes)
    mock_logger = mocker.patch("qualibrate.utils.logger_m.logger.info")

    local_manager_root.save(node)

    mock_logger.assert_any_call("Saving node test_node to local storage")
    assert local_manager_root.snapshot_idx == mock_generate.return_value["id"]
    assert mock_data_handler.return_value.node_data == {
        "quam": "./quam_state.json",
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


def test_machine_content_mapping_logic(
    data_handler_path, mock_generate, local_manager_root
):
    local_manager_root.machine_content_mapping = {
        "wiring.json": {"missing_attr"}
    }

    machine = MagicMock()
    machine.save = MagicMock()
    del machine.missing_attr  # delete attr

    node = DummyNode(machine=machine)

    local_manager_root.save(node)

    machine.save.assert_called_with(path=data_handler_path / "quam_state.json")
    assert local_manager_root.snapshot_idx == mock_generate.return_value["id"]


def test_save_active_machine_path(mock_generate):
    root_folder = Path("/tmp/test_folder")
    active_path = Path("/tmp/active_machine")
    manager = LocalStorageManager(root_folder, active_path)

    machine = MagicMock()
    node = DummyNode(machine=machine)

    manager.save(node)

    machine.save.assert_called_with(
        path=active_path,
        content_mapping=LocalStorageManager.machine_content_mapping,
    )
    assert manager.snapshot_idx == mock_generate.return_value["id"]
