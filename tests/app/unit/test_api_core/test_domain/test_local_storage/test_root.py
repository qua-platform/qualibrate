import pytest

from qualibrate_app.api.core.domain.local_storage.root import RootLocalStorage
from qualibrate_app.api.core.types import (
    PageFilter,
    SearchFilter,
    SearchWithIdFilter,
)
from qualibrate_app.api.exceptions.classes.storage import QFileNotFoundException


class TestLocalStorageRoot:
    @pytest.fixture(autouse=True, scope="function")
    def setup_root(self, settings):
        self.root = RootLocalStorage(settings=settings)

    def test__get_latest_node_id_node_not_found(self, mocker, settings):
        patched_find_latest = mocker.patch(
            (
                "qualibrate_app.api.core.domain.local_storage.root"
                ".find_nodes_ids_by_filter"
            ),
            return_value=iter([]),
        )
        with pytest.raises(QFileNotFoundException) as ex:
            self.root._get_latest_node_id("msg")
        assert ex.type == QFileNotFoundException
        assert ex.value.args == ("There is no msg",)
        patched_find_latest.assert_called_once_with(
            settings.storage.location,
            project_name=settings.project,
            descending=True,
        )

    def test__get_latest_node_id_valid(self, mocker, settings):
        patched_find_latest = mocker.patch(
            (
                "qualibrate_app.api.core.domain.local_storage.root"
                ".find_nodes_ids_by_filter"
            ),
            return_value=iter([1]),
        )
        assert self.root._get_latest_node_id("msg") == 1
        patched_find_latest.assert_called_once_with(
            settings.storage.location,
            project_name=settings.project,
            descending=True,
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
        search_filter_ = SearchWithIdFilter()

        class _Branch:
            def get_latest_snapshots(
                self,
                pages_filter: PageFilter,
                search_filter: SearchFilter | None = None,
                descending: bool = True,
            ):
                assert pages_filter == PageFilter(page=1, per_page=2)
                assert search_filter is search_filter_
                assert descending is False
                return 2, [1, 2]

        patched_branch = mocker.patch(
            (
                "qualibrate_app.api.core.domain.local_storage.root"
                ".BranchLocalStorage"
            ),
            return_value=_Branch(),
        )
        assert self.root.get_latest_snapshots(
            pages_filter=PageFilter(page=1, per_page=2),
            search_filter=search_filter_,
            descending=False,
        ) == (2, [1, 2])
        patched_branch.assert_called_once_with("main", settings=settings)

    def test_search_snapshots_data(self, mocker, settings):
        branch = mocker.patch(
            "qualibrate_app.api.core.domain.local_storage.root.BranchLocalStorage"
        )
        search_filter = SearchWithIdFilter()
        pages_filter = PageFilter()
        data_path = []
        descending = True
        filter_no_change = True
        self.root.search_snapshots_data(
            search_filter=search_filter,
            pages_filter=pages_filter,
            data_path=data_path,
            descending=descending,
            filter_no_change=filter_no_change,
        )
        branch.assert_called_once_with("main", settings=settings)
        branch.return_value.search_snapshots_data.assert_called_once_with(
            search_filter=search_filter,
            pages_filter=pages_filter,
            data_path=data_path,
            descending=descending,
            filter_no_change=filter_no_change,
        )
