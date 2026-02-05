"""Tests for SnapshotJsonHandler."""

import json

import pytest

from qualibrate.core.storage.snapshot_json_handler import SnapshotJsonHandler


@pytest.fixture
def temp_data_folder(tmp_path):
    """Create a temporary data folder structure."""
    return tmp_path


@pytest.fixture
def json_handler(temp_data_folder):
    """Create a SnapshotJsonHandler instance."""
    return SnapshotJsonHandler(temp_data_folder)


@pytest.fixture
def snapshot_folder(temp_data_folder):
    """Create a snapshot folder with node.json."""
    date_folder = temp_data_folder / "2024-01-20"
    date_folder.mkdir(parents=True)
    snapshot_folder = date_folder / "#42_test_node_150558"
    snapshot_folder.mkdir()
    return snapshot_folder


@pytest.fixture
def node_json_path(snapshot_folder):
    """Create a node.json file."""
    path = snapshot_folder / "node.json"
    content = {
        "id": 42,
        "metadata": {
            "name": "test_node",
            "type_of_execution": "node",
        },
        "data": {"outcomes": {"q1": "successful"}},
    }
    with path.open("w") as f:
        json.dump(content, f)
    return path


class TestSnapshotJsonHandler:
    """Tests for SnapshotJsonHandler class."""

    def test_initialization(self, temp_data_folder):
        """Test handler initialization."""
        handler = SnapshotJsonHandler(temp_data_folder)
        assert handler.root_data_folder == temp_data_folder

    def test_get_node_json_path_found(self, json_handler, node_json_path):
        """Test finding existing snapshot."""
        result = json_handler.get_node_json_path(42)
        assert result is not None
        assert result == node_json_path

    def test_get_node_json_path_not_found(self, json_handler):
        """Test finding non-existent snapshot."""
        result = json_handler.get_node_json_path(999)
        assert result is None

    def test_read_node_json_success(self, json_handler, node_json_path):
        """Test reading valid node.json file."""
        result = json_handler.read_node_json(node_json_path)
        assert result is not None
        assert result["id"] == 42
        assert result["metadata"]["name"] == "test_node"

    def test_read_node_json_file_not_found(self, json_handler, tmp_path):
        """Test reading non-existent file."""
        path = tmp_path / "nonexistent.json"
        result = json_handler.read_node_json(path)
        assert result is None

    def test_read_node_json_invalid_json(self, json_handler, tmp_path):
        """Test reading invalid JSON file."""
        path = tmp_path / "invalid.json"
        path.write_text("{ invalid json }")
        result = json_handler.read_node_json(path)
        assert result is None

    def test_write_node_json_success(self, json_handler, tmp_path):
        """Test writing node.json file."""
        path = tmp_path / "test.json"
        content = {"id": 123, "data": {"value": "test"}}
        result = json_handler.write_node_json(path, content)
        assert result is True
        assert path.exists()
        with path.open() as f:
            saved = json.load(f)
        assert saved == content

    def test_write_node_json_with_datetime(self, json_handler, tmp_path):
        """Test writing node.json with datetime (uses default=str)."""
        from datetime import datetime

        path = tmp_path / "test.json"
        now = datetime.now()
        content = {"timestamp": now}
        result = json_handler.write_node_json(path, content)
        assert result is True

    def test_read_snapshot_convenience(self, json_handler, node_json_path):
        """Test read_snapshot convenience method."""
        result = json_handler.read_snapshot(42)
        assert result is not None
        assert result["id"] == 42

    def test_read_snapshot_not_found(self, json_handler):
        """Test read_snapshot for non-existent snapshot."""
        result = json_handler.read_snapshot(999)
        assert result is None

    def test_write_snapshot_success(self, json_handler, node_json_path):
        """Test write_snapshot convenience method."""
        content = {"id": 42, "updated": True}
        result = json_handler.write_snapshot(42, content)
        assert result is True
        # Verify the file was updated
        with node_json_path.open() as f:
            saved = json.load(f)
        assert saved["updated"] is True

    def test_write_snapshot_not_found(self, json_handler):
        """Test write_snapshot for non-existent snapshot."""
        result = json_handler.write_snapshot(999, {"data": "test"})
        assert result is False
