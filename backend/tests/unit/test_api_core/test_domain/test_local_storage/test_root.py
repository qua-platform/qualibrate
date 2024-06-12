import pytest

from qualibrate_app.api.core.domain.local_storage.root import RootLocalStorage
from qualibrate_app.api.exceptions.classes.storage import QFileNotFoundException


class TestLocalStorageRoot:
    @pytest.fixture(autouse=True, scope="function")
    def setup_root(self, settings):
        self.root = RootLocalStorage(settings=settings)

    def test__get_latest_node_id_node_not_found(self, mocker, settings):
        patched_find_latest = mocker.patch(
            (
                "qualibrate_app.api.core.domain.local_storage.root"
                ".find_n_latest_nodes_ids"
            ),
            return_value=iter([]),
        )
        with pytest.raises(QFileNotFoundException) as ex:
            self.root._get_latest_node_id("msg")
        assert ex.type == QFileNotFoundException
        assert ex.value.args == ("There is no msg",)
        patched_find_latest.assert_called_once_with(
            settings.user_storage, 1, 1, settings.project
        )

    def test__get_latest_node_id_valid(self, mocker, settings):
        patched_find_latest = mocker.patch(
            (
                "qualibrate_app.api.core.domain.local_storage.root"
                ".find_n_latest_nodes_ids"
            ),
            return_value=iter([1]),
        )
        assert self.root._get_latest_node_id("msg") == 1
        patched_find_latest.assert_called_once_with(
            settings.user_storage, 1, 1, settings.project
        )

    def test_get_snapshot_latest(self, mocker, settings):
        patched_get_latest = mocker.patch.object(
            self.root, "_get_latest_node_id", return_value=1
        )
        patched_snapshot = mocker.patch(
            (
                "qualibrate_app.api.core.domain.local_storage.root"
                ".SnapshotLocalStorage"
            ),
            return_value="snapshot_1",
        )
        assert self.root.get_snapshot() == "snapshot_1"
        patched_get_latest.assert_called_once_with("snapshot")
        patched_snapshot.assert_called_once_with(1, settings=settings)

    def test_get_snapshot_concrete(self, mocker, settings):
        patched_get_latest = mocker.patch.object(
            self.root, "_get_latest_node_id"
        )
        patched_snapshot = mocker.patch(
            (
                "qualibrate_app.api.core.domain.local_storage.root"
                ".SnapshotLocalStorage"
            ),
            return_value="snapshot_2",
        )
        assert self.root.get_snapshot(2) == "snapshot_2"
        patched_get_latest.assert_not_called()
        patched_snapshot.assert_called_once_with(2, settings=settings)

    def test_get_node_latest(self, mocker, settings):
        patched_get_latest = mocker.patch.object(
            self.root, "_get_latest_node_id", return_value=1
        )
        patched_snapshot = mocker.patch(
            (
                "qualibrate_app.api.core.domain.local_storage.root"
                ".NodeLocalStorage"
            ),
            return_value="node_1",
        )
        assert self.root.get_node() == "node_1"
        patched_get_latest.assert_called_once_with("node")
        patched_snapshot.assert_called_once_with(1, settings=settings)

    def test_get_node_concrete(self, mocker, settings):
        patched_get_latest = mocker.patch.object(
            self.root, "_get_latest_node_id"
        )
        patched_snapshot = mocker.patch(
            (
                "qualibrate_app.api.core.domain.local_storage.root"
                ".NodeLocalStorage"
            ),
            return_value="node_2",
        )
        assert self.root.get_node(2) == "node_2"
        patched_get_latest.assert_not_called()
        patched_snapshot.assert_called_once_with(2, settings=settings)

    def test_get_latest_snapshots(self, mocker, settings):
        class _Branch:
            def get_latest_snapshots(self, page, per_page, reverse):
                assert page == 1
                assert per_page == 2
                assert reverse is False
                return [1, 2]

        patched_branch = mocker.patch(
            (
                "qualibrate_app.api.core.domain.local_storage.root"
                ".BranchLocalStorage"
            ),
            return_value=_Branch(),
        )
        assert self.root.get_latest_snapshots(1, 2, False) == [1, 2]
        patched_branch.assert_called_once_with("main", settings=settings)
