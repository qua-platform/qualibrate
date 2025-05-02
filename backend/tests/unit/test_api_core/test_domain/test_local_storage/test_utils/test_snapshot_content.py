import json
from datetime import datetime
from pathlib import Path
from unittest.mock import PropertyMock, call

import pytest

from qualibrate_app.api.core.domain.bases.snapshot import SnapshotLoadType
from qualibrate_app.api.core.domain.local_storage.utils import snapshot_content
from qualibrate_app.api.core.utils.path.node import NodePath
from qualibrate_app.api.exceptions.classes.storage import QFileNotFoundException


def test_read_minified_node_content_node_info_filled(mocker, settings):
    dt = datetime.now().astimezone()
    patched_get_id_local_path = mocker.patch(
        (
            "qualibrate_app.api.core.domain.local_storage._id_to_local_path"
            ".IdToLocalPath.get"
        ),
        side_effect=[1, 2],
    )
    patched_is_file = mocker.patch("pathlib.Path.is_file")
    result = snapshot_content.read_minified_node_content(
        {
            "id": 3,
            "parents": [1, 2],
            "created_at": dt.isoformat(),
            "run_start": dt.isoformat(),
            "run_end": dt.isoformat(),
        },
        None,
        None,
        settings,
    )
    assert result == {
        "id": 3,
        "parents": [1, 2],
        "created_at": dt,
        "run_start": dt,
        "run_end": dt,
    }
    patched_is_file.assert_not_called()
    patched_get_id_local_path.assert_has_calls(
        [
            call("project", 1, settings.storage.location),
            call("project", 2, settings.storage.location),
        ]
    )


def test_read_minified_node_content_node_info_empty_valid_id_file_exists(
    mocker, settings
):
    ts = 1712932811

    class FileStat:
        st_mtime = ts

    settings.storage.location.mkdir()
    node_file = settings.storage.location / "node_file.json"
    node_file.touch()
    patched_get_id_local_path = mocker.patch(
        (
            "qualibrate_app.api.core.domain.local_storage._id_to_local_path"
            ".IdToLocalPath.get"
        ),
        return_value=1,
    )
    patched_path_stat = mocker.patch(
        "pathlib.Path.stat", return_value=FileStat()
    )
    patched_path_parent = mocker.patch(
        "pathlib.Path.parent", new_callable=PropertyMock
    )
    patched_is_file = mocker.patch("pathlib.Path.is_file", return_value=True)
    result = snapshot_content.read_minified_node_content(
        {}, 2, node_file, settings
    )
    assert result == {
        "id": 2,
        "parents": [1],
        "created_at": datetime.fromtimestamp(ts).astimezone(),
        "run_start": None,
        "run_end": None,
    }
    patched_is_file.assert_called_once()
    patched_get_id_local_path.assert_called_once_with(
        "project", 1, settings.storage.location
    )
    patched_path_stat.assert_called_once()
    patched_path_parent.assert_not_called()


def test_read_minified_node_content_node_info_empty_no_id_no_file(
    mocker, settings
):
    ts = 1712932811

    class FileStat:
        st_mtime = ts

    node_dir = settings.storage.location / "node_dir"
    node_dir.mkdir(parents=True)
    node_file = node_dir / "node_file.json"
    patched_get_id_local_path = mocker.patch(
        (
            "qualibrate_app.api.core.domain.local_storage._id_to_local_path"
            ".IdToLocalPath.get"
        ),
    )
    patched_file_stat_patch = mocker.patch(
        "pathlib.Path.stat", return_value=FileStat()
    )
    patched_is_file = mocker.patch("pathlib.Path.is_file", return_value=False)
    patched_path_parent = mocker.patch(
        "pathlib.Path.parent", new_callable=PropertyMock, return_value=node_dir
    )
    result = snapshot_content.read_minified_node_content(
        {}, None, node_file, settings
    )
    assert result == {
        "id": -1,
        "parents": [],
        "created_at": datetime.fromtimestamp(ts).astimezone(),
        "run_start": None,
        "run_end": None,
    }
    patched_is_file.assert_called_once()
    patched_get_id_local_path.assert_not_called()
    patched_file_stat_patch.assert_called_once()
    patched_path_parent.assert_called_once()


def test_read_metadata_node_content_node_info_filled(mocker, settings):
    metadata = {"name": "name", "data_path": "subpath", "custom": "info"}
    result = snapshot_content.read_metadata_node_content(
        {"metadata": metadata},
        None,
        settings.storage.location,
        settings,
    )
    assert result == metadata


def test_read_metadata_node_content_node_info_not_filled(mocker, settings):
    mocker.patch("pathlib.Path.relative_to", return_value=Path("subpath"))
    result = snapshot_content.read_metadata_node_content(
        {"metadata": {"custom": "info"}},
        "node_name",
        settings.storage.location / "subpath",
        settings,
    )
    assert result == {
        "name": "node_name",
        "data_path": "subpath",
        "custom": "info",
    }


def test_read_data_node_content_valid_path_specified_with_others(tmp_path):
    node_path = tmp_path / "node.json"
    state_path = tmp_path / "state_.json"
    state_path_content = {"a": "b", "c": 3}
    state_path.write_text(json.dumps(state_path_content))
    parameters_model = {"p1": "v1", "p2": 2}
    outcomes = {"q1": "successful", "q2": "failed"}
    node_info = {
        "data": {
            "quam": "state_.json",
            "parameters": {"model": parameters_model},
            "outcomes": outcomes,
        },
    }
    assert snapshot_content.read_data_node_content(
        node_info, node_path, tmp_path
    ) == {
        "quam": state_path_content,
        "parameters": parameters_model,
        "outcomes": outcomes,
    }


def test_read_data_node_content_valid_path_specified_without_others(tmp_path):
    node_path = tmp_path / "node.json"
    state_path = tmp_path / "state_.json"
    state_path_content = {"a": "b", "c": 3}
    state_path.write_text(json.dumps(state_path_content))
    node_info = {"data": {"quam": "state_.json"}}
    assert snapshot_content.read_data_node_content(
        node_info, node_path, tmp_path
    ) == {
        "quam": state_path_content,
        "parameters": None,
        "outcomes": None,
    }


def test_read_data_node_content_path_not_specified(tmp_path):
    node_path = tmp_path / "node.json"
    state_path = tmp_path / "state.json"
    state_path_content = {"a": "b", "c": 3}
    state_path.write_text(json.dumps(state_path_content))
    assert snapshot_content.read_data_node_content({}, node_path, tmp_path) == {
        "quam": None,
        "parameters": None,
        "outcomes": None,
    }


def test_read_data_node_content_invalid_path(tmp_path):
    node_path = tmp_path / "node.json"
    with pytest.raises(QFileNotFoundException) as ex:
        snapshot_content.read_data_node_content(
            {"data": {"quam": "../../state.json"}}, node_path, tmp_path
        )
    assert ex.type == QFileNotFoundException
    assert ex.value.args == ("Unknown quam data path",)


@pytest.mark.parametrize("file_exists", (False, True))
def test_default_snapshot_content_loader_node_file_issue(
    mocker, tmp_path, file_exists
):
    node_path = NodePath(tmp_path / "2024-04-27" / "#1_name_120000")
    node_path.mkdir(parents=True)
    patched_node_path_id = mocker.patch.object(
        node_path.__class__, "id", new_callable=PropertyMock, return_value=1
    )
    patched_node_path_name = mocker.patch.object(
        node_path.__class__,
        "node_name",
        new_callable=PropertyMock,
        return_value="name",
    )
    if file_exists:
        # node file exists; but contains invalid json
        (node_path / "node.json").touch()
        mocker.patch(
            "json.load", side_effect=json.JSONDecodeError("msg", "doc", 1)
        )
    else:
        # there is no node file
        mocker.patch("pathlib.Path.is_file", return_value=False)
    patched_read_minified = mocker.patch(
        (
            "qualibrate_app.api.core.domain.local_storage.utils."
            "snapshot_content.read_minified_node_content"
        ),
        return_value={"minified": {}},
    )
    assert snapshot_content.default_snapshot_content_loader(
        node_path, SnapshotLoadType.Minified, None
    ) == {"minified": {}}
    patched_node_path_id.assert_called_once()
    patched_read_minified.assert_called_once_with(
        {}, 1, node_path / "node.json", None
    )
    patched_node_path_name.assert_not_called()


def test_default_snapshot_content_loader_node_valid_minified(mocker, tmp_path):
    node_info = {"a": 1}
    node_path = NodePath(tmp_path / "2024-04-27" / "#1_name_120000")
    node_path.mkdir(parents=True)
    node_file = node_path / "node.json"
    node_file.write_text(json.dumps(node_info))
    patched_node_path_id = mocker.patch.object(
        node_path.__class__, "id", new_callable=PropertyMock, return_value=1
    )
    patched_node_path_name = mocker.patch.object(
        node_path.__class__, "node_name"
    )
    patched_read_minified = mocker.patch(
        (
            "qualibrate_app.api.core.domain.local_storage.utils."
            "snapshot_content.read_minified_node_content"
        ),
        return_value={"minified": {}},
    )
    assert snapshot_content.default_snapshot_content_loader(
        node_path, SnapshotLoadType.Minified, None
    ) == {"minified": {}}

    patched_read_minified.assert_called_once_with(node_info, 1, node_file, None)
    patched_node_path_id.assert_called_once()
    patched_node_path_name.assert_not_called()


def test_default_snapshot_content_loader_node_valid_metadata(mocker, tmp_path):
    node_info = {"a": 1}
    node_path = NodePath(tmp_path / "2024-04-27" / "#1_name_120000")
    node_path.mkdir(parents=True)
    patched_node_path_id = mocker.patch.object(
        node_path.__class__, "id", new_callable=PropertyMock, return_value=1
    )
    patched_node_path_name = mocker.patch.object(
        node_path.__class__,
        "node_name",
        new_callable=PropertyMock,
        return_value="name",
    )
    node_file = node_path / "node.json"
    node_file.write_text(json.dumps(node_info))
    patched_read_minified = mocker.patch(
        (
            "qualibrate_app.api.core.domain.local_storage.utils."
            "snapshot_content.read_minified_node_content"
        ),
        return_value={"minified": {}},
    )
    patched_read_metadata = mocker.patch(
        (
            "qualibrate_app.api.core.domain.local_storage.utils."
            "snapshot_content.read_metadata_node_content"
        ),
        return_value={},
    )
    patched_read_data = mocker.patch(
        (
            "qualibrate_app.api.core.domain.local_storage.utils."
            "snapshot_content.read_data_node_content"
        ),
    )
    assert snapshot_content.default_snapshot_content_loader(
        node_path, SnapshotLoadType.Metadata, None
    ) == {"minified": {}, "metadata": {}}
    patched_read_minified.assert_called_once_with(node_info, 1, node_file, None)
    patched_node_path_id.assert_called_once()
    patched_node_path_name.assert_called_once()
    patched_read_metadata.assert_called_once_with(
        node_info, "name", node_path, None
    )
    patched_read_data.assert_not_called()


def test_default_snapshot_content_loader_node_valid_data(mocker, tmp_path):
    node_info = {"a": 1}
    node_path = NodePath(tmp_path / "2024-04-27" / "#1_name_120000")
    node_path.mkdir(parents=True)
    patched_node_path_id = mocker.patch.object(
        node_path.__class__, "id", new_callable=PropertyMock, return_value=1
    )
    patched_node_path_name = mocker.patch.object(
        node_path.__class__,
        "node_name",
        new_callable=PropertyMock,
        return_value="name",
    )
    node_filepath = node_path / "node.json"
    node_filepath.write_text(json.dumps(node_info))
    patched_read_minified = mocker.patch(
        (
            "qualibrate_app.api.core.domain.local_storage.utils."
            "snapshot_content.read_minified_node_content"
        ),
        return_value={"minified": {}},
    )
    patched_read_metadata = mocker.patch(
        (
            "qualibrate_app.api.core.domain.local_storage.utils."
            "snapshot_content.read_metadata_node_content"
        ),
        return_value={},
    )
    _read_data_node_content = {"quam": {}, "parameters": None}
    patched_read_data = mocker.patch(
        (
            "qualibrate_app.api.core.domain.local_storage.utils."
            "snapshot_content.read_data_node_content"
        ),
        return_value=_read_data_node_content,
    )
    assert snapshot_content.default_snapshot_content_loader(
        node_path, SnapshotLoadType.Data, None
    ) == {"minified": {}, "metadata": {}, "data": _read_data_node_content}
    patched_node_path_id.assert_called_once()
    patched_node_path_name.assert_called_once()
    patched_read_minified.assert_called_once_with(
        node_info, 1, node_filepath, None
    )
    patched_read_metadata.assert_called_once_with(
        node_info, "name", node_path, None
    )
    patched_read_data.assert_called_once_with(
        node_info, node_filepath, node_path
    )
