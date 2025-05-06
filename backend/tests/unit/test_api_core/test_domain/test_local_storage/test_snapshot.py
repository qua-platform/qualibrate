from datetime import datetime
from unittest.mock import PropertyMock, call

import pytest

from qualibrate_app.api.core.domain.bases.snapshot import SnapshotLoadType
from qualibrate_app.api.core.domain.local_storage import snapshot
from qualibrate_app.api.exceptions.classes.values import QValueException


class TestSnapshotLocalStorage:
    @pytest.fixture(autouse=True)
    def setup(self, settings):
        self.snapshot = snapshot.SnapshotLocalStorage(3, settings=settings)

    def test_load_valid(self, mocker):
        self.snapshot._load_type = SnapshotLoadType.Empty
        self.snapshot.content = {}
        mocker.patch(
            "qualibrate_app.api.core.domain.local_storage.snapshot"
            ".IdToLocalPath.get_or_raise"
        )
        snapshot_loader_patched = mocker.patch.object(
            self.snapshot, "_snapshot_loader", return_value={"a": "b"}
        )
        self.snapshot.load(SnapshotLoadType.Minified)
        snapshot_loader_patched.assert_called_once()
        assert self.snapshot.content == {"a": "b"}

    def test_load_state_already_loaded(self, mocker):
        self.snapshot._load_type = SnapshotLoadType.Minified
        get_or_raise_patched = mocker.patch(
            "qualibrate_app.api.core.domain.local_storage.snapshot"
            ".IdToLocalPath.get_or_raise"
        )
        self.snapshot.load(SnapshotLoadType.Minified)
        get_or_raise_patched.assert_not_called()

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
            "qualibrate_app.api.core.domain.local_storage.snapshot"
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
        data = {"quam": {"k": "v"}}
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
                "qualibrate_app.api.core.domain.local_storage.snapshot"
                ".get_subpath_value"
            ),
            return_value=[{}],
        )
        assert self.snapshot.search(search_path, load) == [{}]
        if load:
            load_patched.assert_called_once_with(SnapshotLoadType.Data)
        else:
            load_patched.assert_not_called()
        search_patched.assert_called_once_with(data["quam"], search_path)

    def test_get_latest_snapshots_one(self, mocker, settings):
        load_patched = mocker.patch.object(self.snapshot, "load")
        find_latest_patched = mocker.patch(
            "qualibrate_app.api.core.domain.local_storage.snapshot"
            ".find_latest_node_id",
            return_value=3,
        )
        find_n_latest_patched = mocker.patch(
            "qualibrate_app.api.core.domain.local_storage.snapshot."
            "find_n_latest_nodes_ids"
        )
        assert self.snapshot.get_latest_snapshots(1, 1) == (3, [self.snapshot])
        load_patched.assert_called_once_with(SnapshotLoadType.Metadata)
        find_latest_patched.assert_called_once_with(settings.storage.location)
        find_n_latest_patched.assert_not_called()

    def test_get_latest_snapshots_more(self, mocker, settings):
        load_patched = mocker.patch(
            "qualibrate_app.api.core.domain.local_storage.snapshot"
            ".SnapshotLocalStorage.load"
        )
        find_latest_patched = mocker.patch(
            "qualibrate_app.api.core.domain.local_storage.snapshot"
            ".find_latest_node_id",
            return_value=3,
        )
        find_n_latest_patched = mocker.patch(
            (
                "qualibrate_app.api.core.domain.local_storage.snapshot"
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
        find_latest_patched.assert_called_once_with(settings.storage.location)
        find_n_latest_patched.assert_called_once_with(
            settings.storage.location,
            1,
            2,
            settings.project,
            max_node_id=2,
        )

    def test_compare_by_id_same_snapshot(self, mocker):
        load_patched = mocker.patch(
            "qualibrate_app.api.core.domain.local_storage.snapshot"
            ".SnapshotLocalStorage.load"
        )
        with pytest.raises(QValueException) as ex:
            self.snapshot.compare_by_id(3)
        assert ex.type == QValueException
        assert ex.value.args == ("Can't compare snapshots with same id",)
        load_patched.assert_not_called()

    def test_compare_by_id_current_data_is_empty(self, mocker):
        load_patched = mocker.patch(
            "qualibrate_app.api.core.domain.local_storage.snapshot"
            ".SnapshotLocalStorage.load"
        )
        mocker.patch(
            (
                "qualibrate_app.api.core.domain.local_storage.snapshot"
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
            "qualibrate_app.api.core.domain.local_storage.snapshot"
            ".SnapshotLocalStorage.load"
        )
        mocker.patch(
            (
                "qualibrate_app.api.core.domain.local_storage.snapshot"
                ".SnapshotLocalStorage.data"
            ),
            new_callable=PropertyMock,
            side_effect=[{"quam": {}}, None, None],
        )
        with pytest.raises(QValueException) as ex:
            self.snapshot.compare_by_id(2)
        assert ex.type == QValueException
        assert ex.value.args == ("Can't load data of snapshot 2",)
        load_patched.assert_has_calls([call(SnapshotLoadType.Data)] * 2)

    def test_compare_by_id_valid(self, mocker):
        load_patched = mocker.patch(
            "qualibrate_app.api.core.domain.local_storage.snapshot"
            ".SnapshotLocalStorage.load"
        )
        mocker.patch(
            (
                "qualibrate_app.api.core.domain.local_storage.snapshot"
                ".SnapshotLocalStorage.data"
            ),
            new_callable=PropertyMock,
            side_effect=[{"quam": {"a": "b"}}, {"quam": {"c": "d"}}],
        )
        make_patch_patched = mocker.patch(
            "jsonpatch.make_patch", return_value=[{"diff": "a"}]
        )
        p2m_patched = mocker.patch(
            (
                "qualibrate_app.api.core.domain.local_storage.snapshot"
                ".jsonpatch_to_mapping"
            ),
            return_value={"d": "x"},
        )
        assert self.snapshot.compare_by_id(2) == {"d": "x"}
        load_patched.assert_has_calls([call(SnapshotLoadType.Data)] * 2)
        make_patch_patched.assert_called_once_with({"a": "b"}, {"c": "d"})
        p2m_patched.assert_called_once_with({"a": "b"}, [{"diff": "a"}])

    def test_update_entry_no_data(self, mocker):
        load_patched = mocker.patch.object(self.snapshot, "load")
        mocker.patch.object(
            self.snapshot.__class__,
            "data",
            new_callable=PropertyMock,
            return_value=None,
        )
        assert self.snapshot.update_entry({}) is False
        load_patched.assert_called_once_with(SnapshotLoadType.Data)

    def test_update_entry_valid_data(self, mocker):
        load_patched = mocker.patch.object(self.snapshot, "load")
        original = {"a": "b", "c": 2, "d": {"e": "f", "g": 1}}
        updated = {"a": "x", "c": 2, "d": {"e": "f", "g": 4}}

        def _check_new_values(_snapshot_path, new_snapshot, patches, _settings):
            assert patches == [
                {"op": "replace", "path": "/quam/a", "value": "x", "old": "b"},
                {"op": "replace", "path": "/quam/d/g", "value": 4, "old": 1},
            ]
            assert new_snapshot["quam"] == updated
            return True

        mocker.patch.object(
            self.snapshot.__class__,
            "data",
            new_callable=PropertyMock,
            return_value={"quam": original},
        )
        mocker.patch.object(
            self.snapshot.__class__,
            "node_path",
            new_callable=PropertyMock,
        )
        mocker.patch.object(
            self.snapshot,
            "_snapshot_updater",
            _check_new_values,
        )
        assert self.snapshot.update_entry({"#/a": "x", "#/d/g": 4}) is True
        load_patched.assert_called_once_with(SnapshotLoadType.Data)
