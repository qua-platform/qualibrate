import json
from datetime import datetime
from pathlib import Path
from unittest.mock import PropertyMock, call

import pytest

from qualibrate.api.core.domain.bases.snapshot import SnapshotLoadType
from qualibrate.api.core.domain.local_storage import snapshot
from qualibrate.api.core.utils.path.node import NodePath
from qualibrate.api.exceptions.classes.storage import QFileNotFoundException
from qualibrate.api.exceptions.classes.values import QValueException


def test__read_minified_node_content_node_info_filled(mocker, tmp_path):
    class _Settings:
        user_storage = tmp_path
        project = "project"

    created_at = datetime.now()
    patched_get_id_local_path = mocker.patch(
        (
            "qualibrate.api.core.domain.local_storage._id_to_local_path"
            ".IdToLocalPath.get"
        ),
        side_effect=[1, 2],
    )
    patched_is_file = mocker.patch("pathlib.Path.is_file")
    result = snapshot._read_minified_node_content(
        {"id": 3, "parents": [1, 2], "created_at": created_at.isoformat()},
        None,
        None,
        _Settings(),
    )
    assert result == {"id": 3, "parents": [1, 2], "created_at": created_at}
    patched_is_file.assert_not_called()
    patched_get_id_local_path.assert_has_calls(
        [call("project", 1, tmp_path), call("project", 2, tmp_path)]
    )


def test__read_minified_node_content_node_info_empty_valid_id_file_exists(
    mocker, tmp_path
):
    class _Settings:
        user_storage = tmp_path
        project = "project"

    class FileStat:
        st_mtime = 1712932811

    node_file = tmp_path / "node_file.json"
    node_file.touch()
    patched_get_id_local_path = mocker.patch(
        (
            "qualibrate.api.core.domain.local_storage._id_to_local_path"
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
    result = snapshot._read_minified_node_content({}, 2, node_file, _Settings())
    assert result == {
        "id": 2,
        "parents": [1],
        "created_at": datetime(2024, 4, 12, 17, 40, 11),
    }
    patched_is_file.assert_called_once()
    patched_get_id_local_path.assert_called_once_with("project", 1, tmp_path)
    patched_path_stat.assert_called_once()
    patched_path_parent.assert_not_called()


def test__read_minified_node_content_node_info_empty_no_id_no_file(
    mocker, tmp_path
):
    class _Settings:
        user_storage = tmp_path
        project = "project"

    class FileStat:
        st_mtime = 1712932811

    node_dir = tmp_path / "node_dir"
    node_dir.mkdir()
    node_file = node_dir / "node_file.json"
    patched_get_id_local_path = mocker.patch(
        (
            "qualibrate.api.core.domain.local_storage._id_to_local_path"
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
    result = snapshot._read_minified_node_content(
        {}, None, node_file, _Settings()
    )
    assert result == {
        "id": -1,
        "parents": [],
        "created_at": datetime(2024, 4, 12, 17, 40, 11),
    }
    patched_is_file.assert_called_once()
    patched_get_id_local_path.assert_not_called()
    patched_file_stat_patch.assert_called_once()
    patched_path_parent.assert_called_once()


def test__read_metadata_node_content_node_info_filled(mocker, tmp_path):
    class _Settings:
        metadata_out_path = "data_path"
        user_storage = tmp_path

    mocker.patch("pathlib.Path.relative_to")
    metadata = {"name": "name", "data_path": "subpath", "custom": "info"}
    result = snapshot._read_metadata_node_content(
        {"metadata": metadata}, None, tmp_path, _Settings()
    )
    assert result == metadata


def test__read_metadata_node_content_node_info_not_filled(mocker, tmp_path):
    class _Settings:
        metadata_out_path = "data_path"
        user_storage = tmp_path

    mocker.patch("pathlib.Path.relative_to", return_value=Path("subpath"))
    result = snapshot._read_metadata_node_content(
        {"metadata": {"custom": "info"}},
        "node_name",
        tmp_path / "subpath",
        _Settings(),
    )
    assert result == {
        "name": "node_name",
        "data_path": "subpath",
        "custom": "info",
    }


def test__read_data_node_content_valid_path_specified(tmp_path):
    node_path = tmp_path / "node.json"
    state_path = tmp_path / "state_.json"
    data_content = {"a": "b", "c": 3}
    state_path.write_text(json.dumps(data_content))
    node_info = {"data": {"quam": "state_.json"}}
    assert (
        snapshot._read_data_node_content(node_info, node_path, tmp_path)
        == data_content
    )


def test__read_data_node_content_path_not_specified(tmp_path):
    node_path = tmp_path / "node.json"
    state_path = tmp_path / "state.json"
    data_content = {"a": "b", "c": 3}
    state_path.write_text(json.dumps(data_content))
    assert (
        snapshot._read_data_node_content({}, node_path, tmp_path)
        == data_content
    )


def test__read_data_node_content_invalid_path(tmp_path):
    node_path = tmp_path / "node.json"
    with pytest.raises(QFileNotFoundException) as ex:
        snapshot._read_data_node_content(
            {"data": {"quam": "../../state.json"}}, node_path, tmp_path
        )
    assert ex.type == QFileNotFoundException
    assert ex.value.args == ("Unknown quam data path",)


@pytest.mark.parametrize("file_exists", (False, True))
def test__default_snapshot_content_loader_node_file_issue(
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
            "qualibrate.api.core.domain.local_storage.snapshot."
            "_read_minified_node_content"
        ),
        return_value={"minified": {}},
    )
    assert snapshot._default_snapshot_content_loader(
        node_path, SnapshotLoadType.Minified, None
    ) == {"minified": {}}
    patched_node_path_id.assert_called_once()
    patched_read_minified.assert_called_once_with(
        {}, 1, node_path / "node.json", None
    )
    patched_node_path_name.assert_not_called()


def test__default_snapshot_content_loader_node_valid_minified(mocker, tmp_path):
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
            "qualibrate.api.core.domain.local_storage.snapshot."
            "_read_minified_node_content"
        ),
        return_value={"minified": {}},
    )
    assert snapshot._default_snapshot_content_loader(
        node_path, SnapshotLoadType.Minified, None
    ) == {"minified": {}}

    patched_read_minified.assert_called_once_with(node_info, 1, node_file, None)
    patched_node_path_id.assert_called_once()
    patched_node_path_name.assert_not_called()


def test__default_snapshot_content_loader_node_valid_metadata(mocker, tmp_path):
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
            "qualibrate.api.core.domain.local_storage.snapshot."
            "_read_minified_node_content"
        ),
        return_value={"minified": {}},
    )
    patched_read_metadata = mocker.patch(
        (
            "qualibrate.api.core.domain.local_storage.snapshot."
            "_read_metadata_node_content"
        ),
        return_value={},
    )
    patched_read_data = mocker.patch(
        (
            "qualibrate.api.core.domain.local_storage.snapshot."
            "_read_data_node_content"
        ),
    )
    assert snapshot._default_snapshot_content_loader(
        node_path, SnapshotLoadType.Metadata, None
    ) == {"minified": {}, "metadata": {}}
    patched_read_minified.assert_called_once_with(node_info, 1, node_file, None)
    patched_node_path_id.assert_called_once()
    patched_node_path_name.assert_called_once()
    patched_read_metadata.assert_called_once_with(
        node_info, "name", node_path, None
    )
    patched_read_data.assert_not_called()


def test__default_snapshot_content_loader_node_valid_data(mocker, tmp_path):
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
            "qualibrate.api.core.domain.local_storage.snapshot."
            "_read_minified_node_content"
        ),
        return_value={"minified": {}},
    )
    patched_read_metadata = mocker.patch(
        (
            "qualibrate.api.core.domain.local_storage.snapshot."
            "_read_metadata_node_content"
        ),
        return_value={},
    )
    patched_read_data = mocker.patch(
        (
            "qualibrate.api.core.domain.local_storage.snapshot."
            "_read_data_node_content"
        ),
        return_value={},
    )
    assert snapshot._default_snapshot_content_loader(
        node_path, SnapshotLoadType.Data, None
    ) == {"minified": {}, "metadata": {}, "data": {}}
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


class TestSnapshotLocalStorage:
    @pytest.fixture(autouse=True)
    def setup(self):
        self.snapshot = snapshot.SnapshotLocalStorage(3)

    def test_load_valid(self, mocker):
        self.snapshot._load_type = SnapshotLoadType.Empty
        self.snapshot.content = {}
        settings_patched = mocker.patch(
            "qualibrate.api.core.domain.local_storage.snapshot.get_settings"
        )
        mocker.patch(
            "qualibrate.api.core.domain.local_storage.snapshot.IdToLocalPath"
            ".get_or_raise"
        )
        mocker.patch.object(
            self.snapshot, "_snapshot_loader", return_value={"a": "b"}
        )
        self.snapshot.load(SnapshotLoadType.Minified)
        settings_patched.assert_called_once()
        assert self.snapshot.content == {"a": "b"}

    def test_load_state_already_loaded(self, mocker):
        self.snapshot._load_type = SnapshotLoadType.Minified
        settings_patched = mocker.patch(
            "qualibrate.api.core.domain.local_storage.snapshot.get_settings"
        )
        self.snapshot.load(SnapshotLoadType.Minified)
        settings_patched.assert_not_called()

    def test_created_at_not_specified(self):
        assert self.snapshot.created_at is None

    def test_created_at_specified(self):
        dt = datetime.now()
        self.snapshot.content["created_at"] = dt
        assert self.snapshot.created_at == dt

    def test_parents_not_specified(self):
        assert self.snapshot.parents is None

    def test_parents_specified(self):
        parents = [1, 2]
        self.snapshot.content["parents"] = parents
        assert self.snapshot.parents == parents

    @pytest.mark.parametrize("load", (True, False))
    def test_search_empty_data(self, mocker, load):
        load_patched = mocker.patch.object(self.snapshot, "load")
        mocker.patch.object(
            self.snapshot.__class__,
            "data",
            new_callable=PropertyMock,
            return_value=None,
        )
        search_patched = mocker.patch(
            "qualibrate.api.core.domain.local_storage.snapshot"
            ".get_subpath_value",
        )
        assert self.snapshot.search([], load) is None
        if load:
            load_patched.assert_called_once_with(SnapshotLoadType.Data)
        else:
            load_patched.assert_not_called()
        search_patched.assert_not_called()

    @pytest.mark.parametrize("load", (True, False))
    def test_search_not_empty_data(self, mocker, load):
        data = {"k": "v"}
        search_path = ["a", 1]
        load_patched = mocker.patch.object(self.snapshot, "load")
        mocker.patch.object(
            self.snapshot.__class__,
            "data",
            new_callable=PropertyMock,
            return_value=data,
        )
        search_patched = mocker.patch(
            (
                "qualibrate.api.core.domain.local_storage.snapshot"
                ".get_subpath_value"
            ),
            return_value=[{}],
        )
        assert self.snapshot.search(search_path, load) == [{}]
        if load:
            load_patched.assert_called_once_with(SnapshotLoadType.Data)
        else:
            load_patched.assert_not_called()
        search_patched.assert_called_once_with(data, search_path)

    def test_get_latest_snapshots_one(self, mocker):
        load_patched = mocker.patch.object(self.snapshot, "load")
        settings_patched = mocker.patch(
            "qualibrate.api.core.domain.local_storage.snapshot.get_settings"
        )
        settings_patched.return_value.user_storage = "user_storage"
        find_latest_patched = mocker.patch(
            "qualibrate.api.core.domain.local_storage.snapshot"
            ".find_latest_node_id",
            return_value=3,
        )
        find_n_latest_patched = mocker.patch(
            "qualibrate.api.core.domain.local_storage.snapshot."
            "find_n_latest_nodes_ids"
        )
        assert self.snapshot.get_latest_snapshots(1, 1) == (3, [self.snapshot])
        load_patched.assert_called_once_with(SnapshotLoadType.Metadata)
        settings_patched.assert_called_once()
        find_latest_patched.assert_called_once_with("user_storage")
        find_n_latest_patched.assert_not_called()

    def test_get_latest_snapshots_more(self, mocker):
        settings_patched = mocker.patch(
            "qualibrate.api.core.domain.local_storage.snapshot.get_settings"
        )
        settings_patched.return_value.user_storage = "user_storage"
        load_patched = mocker.patch(
            "qualibrate.api.core.domain.local_storage.snapshot"
            ".SnapshotLocalStorage.load"
        )
        find_latest_patched = mocker.patch(
            "qualibrate.api.core.domain.local_storage.snapshot"
            ".find_latest_node_id",
            return_value=3,
        )
        find_n_latest_patched = mocker.patch(
            (
                "qualibrate.api.core.domain.local_storage.snapshot"
                ".find_n_latest_nodes_ids"
            ),
            return_value=[2],
        )
        total, snapshots_hist = self.snapshot.get_latest_snapshots(1, 2)

        assert total == 3
        assert len(snapshots_hist) == 2
        assert snapshots_hist[0] == self.snapshot
        assert [snapshot.id for snapshot in snapshots_hist] == [3, 2]
        load_patched.assert_has_calls([call(SnapshotLoadType.Metadata)] * 2)
        find_latest_patched.assert_called_once_with("user_storage")
        find_n_latest_patched.assert_called_once_with("user_storage", 1, 2, 2)
        # assert find_n_latest_patched.call_count == 1
        # find_n_latest_patched.assert_has_calls([])
        # find_call = find_n_latest_patched.mock_calls[0]
        # assert find_call.args == ("user_storage", 2)

        # def _check_partial_kwarg(name, func, args, keywords):
        #     filters = find_call.kwargs.get(name)
        #     assert isinstance(filters, list) and len(filters) == 1
        #     filter_f = filters[0]
        #     assert (
        #         filter_f.func == func
        #         and filter_f.args == args
        #         and filter_f.keywords == keywords
        #     )
        #
        # _check_partial_kwarg(
        #     "date_filters", date_less_or_eq, (), {"date_to_compare": "date"}
        # )
        # _check_partial_kwarg(
        #     "node_filters", id_less_then_snapshot, (), {"node_id_to_compare": 3}
        # )

    def test_compare_by_id_same_snapshot(self, mocker):
        load_patched = mocker.patch(
            "qualibrate.api.core.domain.local_storage.snapshot"
            ".SnapshotLocalStorage.load"
        )
        with pytest.raises(QValueException) as ex:
            self.snapshot.compare_by_id(3)
        assert ex.type == QValueException
        assert ex.value.args == ("Can't compare snapshots with same id",)
        load_patched.assert_not_called()

    def test_compare_by_id_current_data_is_empty(self, mocker):
        load_patched = mocker.patch(
            "qualibrate.api.core.domain.local_storage.snapshot"
            ".SnapshotLocalStorage.load"
        )
        mocker.patch(
            (
                "qualibrate.api.core.domain.local_storage.snapshot"
                ".SnapshotLocalStorage.data"
            ),
            new_callable=PropertyMock,
            return_value=None,
        )
        with pytest.raises(QValueException) as ex:
            self.snapshot.compare_by_id(2)
        assert ex.type == QValueException
        assert ex.value.args == (
            f"Can't load data of snapshot {self.snapshot._id}",
        )
        load_patched.assert_called_once_with(SnapshotLoadType.Data)

    def test_compare_by_id_other_data_is_empty(self, mocker):
        load_patched = mocker.patch(
            "qualibrate.api.core.domain.local_storage.snapshot"
            ".SnapshotLocalStorage.load"
        )
        mocker.patch(
            (
                "qualibrate.api.core.domain.local_storage.snapshot"
                ".SnapshotLocalStorage.data"
            ),
            new_callable=PropertyMock,
            side_effect=[{}, None, None],
        )
        with pytest.raises(QValueException) as ex:
            self.snapshot.compare_by_id(2)
        assert ex.type == QValueException
        assert ex.value.args == ("Can't load data of snapshot 2",)
        load_patched.assert_has_calls([call(SnapshotLoadType.Data)] * 2)

    def test_compare_by_id_valid(self, mocker):
        load_patched = mocker.patch(
            "qualibrate.api.core.domain.local_storage.snapshot"
            ".SnapshotLocalStorage.load"
        )
        mocker.patch(
            (
                "qualibrate.api.core.domain.local_storage.snapshot"
                ".SnapshotLocalStorage.data"
            ),
            new_callable=PropertyMock,
            side_effect=[{"a": "b"}, {"c": "d"}],
        )
        make_patch_patched = mocker.patch(
            "jsonpatch.make_patch", return_value=[{"diff": "a"}]
        )
        p2m_patched = mocker.patch(
            (
                "qualibrate.api.core.domain.local_storage.snapshot"
                ".jsonpatch_to_mapping"
            ),
            return_value={"d": "x"},
        )
        assert self.snapshot.compare_by_id(2) == {"d": "x"}
        load_patched.assert_has_calls([call(SnapshotLoadType.Data)] * 2)
        make_patch_patched.assert_called_once_with({"a": "b"}, {"c": "d"})
        p2m_patched.assert_called_once_with({"a": "b"}, [{"diff": "a"}])
