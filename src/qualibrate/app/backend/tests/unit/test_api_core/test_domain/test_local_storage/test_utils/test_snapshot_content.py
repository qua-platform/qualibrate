import json
from datetime import datetime
from unittest.mock import PropertyMock, call

import pytest

from qualibrate_app.api.core.domain.bases.storage import StorageLoadTypeFlag
from qualibrate_app.api.core.domain.local_storage.utils import snapshot_content
from qualibrate_app.api.core.utils.path.node import NodePath
from qualibrate_app.api.exceptions.classes.storage import QFileNotFoundException


@pytest.fixture
def snapshot_path(tmp_path, settings):
    path = NodePath(tmp_path / "snapshot_path")
    path.mkdir(parents=True, exist_ok=True)
    return path


def test_read_minified_node_content_node_info_filled(mocker, settings):
    dt = datetime.now().astimezone()
    patched_get_id_local_path = mocker.patch(
        (
            "qualibrate_app.api.core.domain.local_storage.utils."
            "snapshot_content.IdToLocalPath.get_path"
        ),
        side_effect=[1, 2],
    )
    patched_is_file = mocker.patch("pathlib.Path.is_file")
    snapshot_path = NodePath(
        settings.storage.location.joinpath("2024-04-12", "#2_node_174011")
    )
    result = snapshot_content.read_minified_node_content(
        {
            "id": 3,
            "parents": [1, 2],
            "created_at": dt.isoformat(),
            "run_start": dt.isoformat(),
            "run_end": dt.isoformat(),
        },
        snapshot_path / "node.json",
        snapshot_path,
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

    snapshot_path = NodePath(
        settings.storage.location.joinpath("2024-04-12", "#2_node_174011")
    )
    snapshot_path.mkdir(exist_ok=True, parents=True)
    node_file = snapshot_path / "node_file.json"
    node_file.touch()
    patched_get_id_local_path = mocker.patch(
        (
            "qualibrate_app.api.core.domain.local_storage.utils."
            "snapshot_content.IdToLocalPath.get_path"
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
        {}, node_file, snapshot_path, settings
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

    snapshot_path = NodePath(
        settings.storage.location.joinpath("2024-04-12", "node_dir")
    )
    snapshot_path.mkdir(exist_ok=True, parents=True)
    node_file = snapshot_path / "node_file.json"
    patched_get_id_local_path = mocker.patch(
        (
            "qualibrate_app.api.core.domain.local_storage.utils."
            "snapshot_content.IdToLocalPath.get_path"
        ),
    )
    patched_file_stat_patch = mocker.patch(
        "pathlib.Path.stat", return_value=FileStat()
    )
    patched_is_file = mocker.patch("pathlib.Path.is_file", return_value=False)
    patched_path_parent = mocker.patch(
        "pathlib.Path.parent",
        new_callable=PropertyMock,
        return_value=snapshot_path,
    )
    result = snapshot_content.read_minified_node_content(
        {}, node_file, snapshot_path, settings
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


def test_read_metadata_node_content_node_info_filled(settings):
    metadata = {"name": "name", "data_path": "subpath", "custom": "info"}
    snapshot_path = NodePath(
        settings.storage.location.joinpath("2024-04-12", "#2_node_174011")
    )
    result = snapshot_content.read_metadata_node_content(
        {"metadata": metadata},
        snapshot_path / "node.json",
        snapshot_path,
        settings,
    )
    assert result == metadata


def test_read_metadata_node_content_node_info_not_filled(mocker, settings):
    mocker.patch(
        "qualibrate_app.api.core.utils.path.node.NodePath.name",
        new_callable=PropertyMock,
        return_value="node_name",
    )
    snapshot_path = NodePath(
        settings.storage.location.joinpath("subpath", "node_name")
    )
    result = snapshot_content.read_metadata_node_content(
        {"metadata": {"custom": "info"}},
        snapshot_path / "file.json",
        snapshot_path,
        settings,
    )
    assert result == {
        "name": "node_name",
        "data_path": "subpath/node_name",
        "custom": "info",
    }


def test_get_node_filepath(snapshot_path):
    assert (
        snapshot_content.get_node_filepath(snapshot_path)
        == snapshot_path / "node.json"
    )


def test_get_data_node_path_valid(snapshot_path):
    node_info = {"data": {"quam": "some_quam.json"}}
    quam_path = snapshot_path / "some_quam.json"
    quam_path.write_text("{}")
    result = snapshot_content.get_data_node_path(
        node_info, snapshot_path / "node.json", snapshot_path
    )
    assert result == quam_path.resolve()


def test_get_data_node_path_outside(snapshot_path):
    node_info = {"data": {"quam": "../hack.json"}}
    node_file = snapshot_path / "node.json"
    with pytest.raises(QFileNotFoundException):
        snapshot_content.get_data_node_path(node_info, node_file, snapshot_path)


def test_update_state_file(tmp_path):
    path = tmp_path / "test.json"
    new_quam = {"foo": "bar"}
    snapshot_content.update_state_file(path, new_quam)
    assert path.exists()
    assert json.loads(path.read_text()) == new_quam


def test_update_state_dir_warns_on_missing_keys(tmp_path, caplog):
    (tmp_path / "state.json").write_text(json.dumps({"a": 1}))
    (tmp_path / "wiring.json").write_text(
        json.dumps({"wiring": {}, "network": {}})
    )
    new_quam = {"a": 2, "wiring": {"x": 1}, "network": {}, "missing": True}
    snapshot_content.update_state_dir(tmp_path, new_quam)
    assert "missing" not in json.loads((tmp_path / "state.json").read_text())
    assert (
        "Not all root items of the new quam state have been saved"
        in caplog.text
    )


def test_update_active_machine_path_file(mocker, tmp_path, settings):
    path = tmp_path / "q.json"
    path.write_text("{}")
    mocker.patch(
        (
            "qualibrate_app.api.core.domain.local_storage.utils."
            "snapshot_content.get_quam_state_path"
        ),
        return_value=path,
    )
    snapshot_content.update_active_machine_path(settings, {"foo": "bar"})
    assert json.loads(path.read_text()) == {"foo": "bar"}


def test_update_active_machine_path_dir(mocker, tmp_path, settings):
    directory = tmp_path / "quam"
    directory.mkdir()
    (directory / "state.json").write_text(json.dumps({"x": 1}))
    mocker.patch(
        (
            "qualibrate_app.api.core.domain.local_storage.utils."
            "snapshot_content.get_quam_state_path"
        ),
        return_value=directory,
    )
    snapshot_content.update_active_machine_path(settings, {"x": 2})
    assert json.loads((directory / "state.json").read_text()) == {"x": 2}


def test_read_quam_content_file(tmp_path):
    path = tmp_path / "file.json"
    path.write_text(json.dumps({"foo": 1}))
    result = snapshot_content.read_quam_content(path)
    assert result == {"foo": 1}


def test_read_quam_content_dir_with_invalid_json(tmp_path, caplog):
    (tmp_path / "ok.json").write_text(json.dumps({"x": 1}))
    (tmp_path / "bad.json").write_text("{ not valid")
    result = snapshot_content.read_quam_content(tmp_path)
    assert result["x"] == 1
    assert "Failed to json decode" in caplog.text


def test_load_snapshot_metadata_from_node_content(
    mocker, snapshot_path, settings
):
    snapshot_info = {"id": 1}
    mocker.patch(
        (
            "qualibrate_app.api.core.domain.local_storage.utils."
            "snapshot_content.read_metadata_node_content"
        ),
        return_value={"foo": "bar"},
    )
    snapshot_content.load_snapshot_metadata_from_node_content(
        {"metadata": {"foo": "bar"}},
        snapshot_path / "node.json",
        snapshot_path,
        settings,
        snapshot_info,
    )
    assert snapshot_info == {"id": 1, "metadata": {"foo": "bar"}}


def test_load_snapshot_data_without_refs_from_node_content(
    snapshot_path, settings
):
    snapshot_info = {}
    node_info = {"data": {"quam": "skip", "machine": "skip", "x": 123}}
    snapshot_content.load_snapshot_data_without_refs_from_node_content(
        node_info,
        snapshot_path / "node.json",
        snapshot_path,
        settings,
        snapshot_info,
    )
    assert snapshot_info["data"] == {"x": 123}


def test_load_snapshot_data_machine_no_machine_key(mocker):
    patched_get_data_node_path = mocker.patch(
        (
            "qualibrate_app.api.core.domain.local_storage.utils."
            "snapshot_content.get_data_node_path"
        ),
        return_value=None,
    )
    patched_read_quam_content = mocker.patch(
        (
            "qualibrate_app.api.core.domain.local_storage.utils."
            "snapshot_content.read_quam_content"
        ),
    )
    snapshot_info = {"data": {}}
    assert (
        snapshot_content.load_snapshot_data_machine_from_node_content(
            {}, "node_path", "snapshot_path", None, snapshot_info
        )
        is None
    )
    patched_get_data_node_path.assert_called_once_with(
        {}, "node_path", "snapshot_path"
    )
    patched_read_quam_content.assert_not_called()
    assert snapshot_info["data"]["quam"] is None


def test_load_snapshot_data_machine_from_node_content(mocker, settings):
    patched_get_data_node_path = mocker.patch(
        (
            "qualibrate_app.api.core.domain.local_storage.utils."
            "snapshot_content.get_data_node_path"
        ),
        return_value="quam_path",
    )
    patched_read_quam_content = mocker.patch(
        (
            "qualibrate_app.api.core.domain.local_storage.utils."
            "snapshot_content.read_quam_content"
        ),
        return_value={"machine": "..."},
    )
    snapshot_info = {"data": {}}
    snapshot_content.load_snapshot_data_machine_from_node_content(
        {}, "node_path", "snapshot_path", None, snapshot_info
    )
    assert snapshot_info["data"]["quam"] == {"machine": "..."}
    patched_get_data_node_path.assert_called_once_with(
        {}, "node_path", "snapshot_path"
    )
    patched_read_quam_content.assert_called_once_with("quam_path")


def test_load_snapshot_data_results_from_node_content(
    mocker, snapshot_path, settings
):
    fake_storage = mocker.MagicMock()
    fake_storage.data = {"some": "results"}
    dfs_patch = mocker.patch(
        (
            "qualibrate_app.api.core.domain.local_storage.utils."
            "snapshot_content.DataFileStorage"
        ),
        return_value=fake_storage,
    )
    snapshot_info = {"data": {}}
    snapshot_content.load_snapshot_data_results_from_node_content(
        {}, snapshot_path / "node.json", snapshot_path, settings, snapshot_info
    )
    assert snapshot_info["data"]["results"] == {"some": "results"}
    dfs_patch.assert_called_once_with(snapshot_path, settings)
    fake_storage.load_from_flag.assert_called_once_with(
        StorageLoadTypeFlag.DataFileWithoutRefs
    )


def test_load_snapshot_data_results_with_imgs_from_node_content(
    mocker, snapshot_path, settings
):
    fake_storage = mocker.MagicMock()
    fake_storage.data = {"imgs": [1, 2, 3]}
    dfs_patch = mocker.patch(
        (
            "qualibrate_app.api.core.domain.local_storage.utils."
            "snapshot_content.DataFileStorage"
        ),
        return_value=fake_storage,
    )
    snapshot_info = {"data": {}}
    snapshot_content.load_snapshot_data_results_with_imgs_from_node_content(
        {}, snapshot_path / "node.json", snapshot_path, settings, snapshot_info
    )
    assert snapshot_info["data"]["results"] == {"imgs": [1, 2, 3]}
    dfs_patch.assert_called_once_with(snapshot_path, settings)
    fake_storage.load_from_flag.assert_called_once_with(
        StorageLoadTypeFlag.DataFileWithImgs
    )


def test_default_snapshot_content_updater_patches_exists(
    mocker, snapshot_path, settings
):
    node_file = snapshot_path / "node.json"
    quam_file = snapshot_path / "quam.json"
    quam_file.write_text("{}")
    node_file.write_text(
        json.dumps(
            {"data": {"quam": "quam.json"}, "patches": [{"patch1": "info"}]}
        )
    )
    mocker.patch(
        "qualibrate_app.api.core.domain.local_storage.utils.snapshot_content."
        "update_active_machine_path"
    )
    result = snapshot_content.default_snapshot_content_updater(
        snapshot_path,
        {"quam": {"x": 1}},
        [{"note": "patch"}],
        settings,
    )
    assert result
    content = json.loads(node_file.read_text())
    assert content["patches"] == [{"patch1": "info"}, {"note": "patch"}]


def test_default_snapshot_content_updater_adds_patch_key(
    mocker, snapshot_path, settings
):
    node_file = snapshot_path / "node.json"
    quam_file = snapshot_path / "quam.json"
    quam_file.write_text("{}")
    node_file.write_text(json.dumps({"data": {"quam": "quam.json"}}))
    mocker.patch(
        "qualibrate_app.api.core.domain.local_storage.utils.snapshot_content."
        "update_active_machine_path"
    )
    result = snapshot_content.default_snapshot_content_updater(
        snapshot_path,
        {"quam": {"y": 2}},
        [{"extra": "patch"}],
        settings,
    )
    assert result
    content = json.loads(node_file.read_text())
    assert content["patches"] == [{"extra": "patch"}]
