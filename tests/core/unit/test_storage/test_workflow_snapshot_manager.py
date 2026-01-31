"""Tests for WorkflowSnapshotManager."""

import json
from unittest.mock import MagicMock

import pytest

from qualibrate.core.models.execution_type import ExecutionType
from qualibrate.core.models.outcome import Outcome
from qualibrate.core.storage.workflow_snapshot_manager import WorkflowSnapshotManager


class DummyGraph:
    """Dummy graph for testing."""

    def __init__(self, name="test_graph", description=None):
        self.name = name
        self.description = description
        self.full_parameters = None


class DummyParameters:
    """Dummy parameters for testing."""

    def model_dump(self, mode=None):
        return {"param1": "value1"}


@pytest.fixture
def temp_data_folder(tmp_path):
    """Create a temporary data folder."""
    return tmp_path


@pytest.fixture
def mock_data_handler(mocker, temp_data_folder):
    """Create a mock DataHandler."""
    handler = MagicMock()
    handler.path = temp_data_folder / "2024-01-20" / "#100_test_100000"
    handler.path.mkdir(parents=True, exist_ok=True)
    handler.generate_node_contents.return_value = {"id": 100}
    return handler


@pytest.fixture
def workflow_manager(temp_data_folder, mock_data_handler):
    """Create a WorkflowSnapshotManager instance."""
    return WorkflowSnapshotManager(temp_data_folder, mock_data_handler)


@pytest.fixture
def create_snapshot(temp_data_folder):
    """Factory to create snapshot folders with node.json."""

    def _create(snapshot_id: int, content: dict = None):
        date_folder = temp_data_folder / "2024-01-20"
        date_folder.mkdir(parents=True, exist_ok=True)
        folder = date_folder / f"#{snapshot_id}_test_{snapshot_id}00000"
        folder.mkdir(exist_ok=True)
        path = folder / "node.json"
        default_content = {
            "id": snapshot_id,
            "metadata": {
                "name": f"test_{snapshot_id}",
                "type_of_execution": "workflow",
                "children": [],
            },
            "data": {"outcomes": {}},
        }
        with path.open("w") as f:
            json.dump(content or default_content, f)
        return path

    return _create


class TestWorkflowSnapshotManager:
    """Tests for WorkflowSnapshotManager class."""

    def test_initialization(self, temp_data_folder, mock_data_handler):
        """Test manager initialization."""
        manager = WorkflowSnapshotManager(temp_data_folder, mock_data_handler)
        assert manager.root_data_folder == temp_data_folder
        assert manager.data_handler == mock_data_handler
        assert manager.json_handler is not None

    def test_start_workflow_snapshot(self, workflow_manager, mock_data_handler):
        """Test creating a workflow snapshot at start."""
        graph = DummyGraph()
        graph.full_parameters = DummyParameters()

        result = workflow_manager.start_workflow_snapshot(graph)

        assert result == 100
        mock_data_handler.save_data.assert_called_once()
        # Verify metadata was set correctly
        node_data = mock_data_handler.node_data
        assert "parameters" in node_data
        assert "outcomes" in node_data

    def test_start_workflow_snapshot_with_parent(
        self, workflow_manager, mock_data_handler
    ):
        """Test creating a nested workflow snapshot with parent ID."""
        graph = DummyGraph()

        workflow_manager.start_workflow_snapshot(graph, workflow_parent_id=50)

        # Verify generate_node_contents was called with parent ID in metadata
        call_args = mock_data_handler.generate_node_contents.call_args
        metadata = call_args.kwargs.get("metadata", call_args.args[0] if call_args.args else {})
        assert metadata.get("workflow_parent_id") == 50

    def test_finalize_workflow_snapshot(self, workflow_manager, create_snapshot):
        """Test finalizing a workflow snapshot."""
        node_json_path = create_snapshot(100)
        graph = DummyGraph()

        result = workflow_manager.finalize_workflow_snapshot(
            graph,
            workflow_snapshot_idx=100,
            children_ids=[101, 102, 103],
            outcomes={"q1": Outcome.SUCCESSFUL, "q2": Outcome.FAILED},
            status="finished",
        )

        assert result is True

        # Verify the file was updated
        with node_json_path.open() as f:
            content = json.load(f)
        assert content["metadata"]["children"] == [101, 102, 103]
        assert content["metadata"]["status"] == "finished"
        assert "run_end" in content["metadata"]
        assert content["data"]["outcomes"] == {
            "q1": "successful",
            "q2": "failed",
        }

    def test_finalize_workflow_snapshot_not_found(self, workflow_manager):
        """Test finalizing non-existent snapshot."""
        graph = DummyGraph()

        result = workflow_manager.finalize_workflow_snapshot(
            graph,
            workflow_snapshot_idx=999,
            children_ids=[],
            outcomes={},
        )

        assert result is False

    def test_track_child_snapshot(self, workflow_manager, create_snapshot):
        """Test tracking a child snapshot."""
        node_json_path = create_snapshot(100)

        result = workflow_manager.track_child_snapshot(100, 101)

        assert result is True
        with node_json_path.open() as f:
            content = json.load(f)
        assert 101 in content["metadata"]["children"]

    def test_track_child_snapshot_no_duplicate(self, workflow_manager, create_snapshot):
        """Test tracking same child doesn't duplicate."""
        create_snapshot(100, {
            "id": 100,
            "metadata": {"children": [101]},
            "data": {},
        })

        result = workflow_manager.track_child_snapshot(100, 101)

        assert result is True

    def test_track_child_snapshot_not_found(self, workflow_manager):
        """Test tracking child for non-existent workflow."""
        result = workflow_manager.track_child_snapshot(999, 101)
        assert result is False

    def test_set_snapshot_workflow_parent(self, workflow_manager, create_snapshot):
        """Test setting workflow parent on a child snapshot."""
        node_json_path = create_snapshot(101, {
            "id": 101,
            "metadata": {"name": "child_node"},
            "data": {},
        })

        result = workflow_manager.set_snapshot_workflow_parent(101, 100)

        assert result is True
        with node_json_path.open() as f:
            content = json.load(f)
        assert content["metadata"]["workflow_parent_id"] == 100
        assert content["metadata"]["type_of_execution"] == ExecutionType.node.value

    def test_set_snapshot_workflow_parent_not_found(self, workflow_manager):
        """Test setting parent for non-existent snapshot."""
        result = workflow_manager.set_snapshot_workflow_parent(999, 100)
        assert result is False


class TestWorkflowSnapshotManagerIntegration:
    """Integration tests simulating workflow execution flow."""

    def test_full_workflow_lifecycle(
        self, workflow_manager, mock_data_handler, create_snapshot
    ):
        """Test complete workflow: start -> track children -> finalize."""
        graph = DummyGraph(name="integration_graph")
        graph.full_parameters = DummyParameters()

        # 1. Start workflow
        workflow_id = workflow_manager.start_workflow_snapshot(graph)
        assert workflow_id == 100

        # 2. Create the workflow's node.json for subsequent operations
        create_snapshot(100)

        # 3. Track children as they complete
        workflow_manager.track_child_snapshot(100, 101)
        workflow_manager.track_child_snapshot(100, 102)

        # 4. Finalize workflow
        outcomes = {"q1": Outcome.SUCCESSFUL, "q2": Outcome.SUCCESSFUL}
        result = workflow_manager.finalize_workflow_snapshot(
            graph,
            workflow_snapshot_idx=100,
            children_ids=[101, 102],
            outcomes=outcomes,
            status="finished",
        )

        assert result is True
