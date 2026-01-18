import pytest

from qualibrate_app.api.core.domain.local_storage.branch import (
    BranchLocalStorage,
)
from qualibrate_app.api.core.types import (
    PageFilter,
    SearchWithIdFilter,
)


class TestLocalStorageBranch:
    @pytest.fixture(autouse=True, scope="function")
    def setup_root(self, settings):
        self.branch = BranchLocalStorage("main", settings=settings)

    @pytest.mark.parametrize("descending", [True, False])
    def test_search_snapshots_data_ascending(
        self, mocker, settings, descending
    ):
        suited_snapshot_ids = list(
            range(4, 0, -1) if descending else range(1, 5)
        )
        patched_find_ids = mocker.patch(
            (
                "qualibrate_app.api.core.domain.local_storage.branch"
                ".find_nodes_ids_by_filter"
            ),
            return_value=suited_snapshot_ids,
        )
        patched_snapshot = mocker.patch(
            (
                "qualibrate_app.api.core.domain.local_storage.branch"
                ".SnapshotLocalStorage"
            ),
            side_effect=lambda _id, settings: _id,
        )
        patched_get_slice = mocker.patch(
            (
                "qualibrate_app.api.core.domain.local_storage.branch"
                ".get_page_slice"
            ),
            side_effect=lambda snapshots, page_filter: list(snapshots),
        )
        patched_find_asc = mocker.patch(
            (
                "qualibrate_app.api.core.utils.find_utils"
                ".search_snapshots_data_with_filter_ascending"
            ),
            side_effect=lambda snapshots, *args: snapshots,
        )
        patched_find_desc = mocker.patch(
            (
                "qualibrate_app.api.core.utils.find_utils"
                ".search_snapshots_data_with_filter_descending"
            ),
            side_effect=lambda snapshots, *args: snapshots,
        )
        page_filter = PageFilter()
        search_filter = SearchWithIdFilter()
        data_path = ["a"]
        filter_no_change = False
        total, sliced = self.branch.search_snapshots_data(
            pages_filter=page_filter,
            search_filter=search_filter,
            data_path=data_path,
            filter_no_change=filter_no_change,
            descending=descending,
        )
        assert total == 0
        assert sliced == suited_snapshot_ids
        patched_find_ids.assert_called_once_with(
            settings.storage.location,
            search_filter=search_filter,
            project_name=settings.project,
            descending=descending,
        )
        patched_snapshot.assert_has_calls(
            [mocker.call(_id, settings=settings) for _id in suited_snapshot_ids]
        )
        if descending:
            patched_find_asc.assert_not_called()
            patched_find_desc.assert_called_once_with(
                mocker.ANY, data_path, filter_no_change
            )
        else:
            patched_find_asc.assert_called_once_with(
                mocker.ANY, data_path, filter_no_change
            )
            patched_find_desc.assert_not_called()
        patched_get_slice.assert_called_once_with(mocker.ANY, page_filter)
