from collections.abc import Sequence
from typing import Any

from qualibrate_app.api.core.domain.bases.branch import BranchBase
from qualibrate_app.api.core.domain.bases.node import NodeBase
from qualibrate_app.api.core.domain.bases.root import RootBase
from qualibrate_app.api.core.domain.bases.snapshot import SnapshotBase
from qualibrate_app.api.core.domain.local_storage.branch import (
    BranchLocalStorage,
)
from qualibrate_app.api.core.domain.local_storage.node import NodeLocalStorage
from qualibrate_app.api.core.domain.local_storage.snapshot import (
    SnapshotLocalStorage,
)
from qualibrate_app.api.core.domain.local_storage.utils.node_utils import (
    find_nodes_ids_by_filter,
)
from qualibrate_app.api.core.models.snapshot import SnapshotSearchResult
from qualibrate_app.api.core.types import (
    IdType,
    PageFilter,
    SearchWithIdFilter,
)
from qualibrate_app.api.exceptions.classes.storage import QFileNotFoundException

__all__ = ["RootLocalStorage"]


class RootLocalStorage(RootBase):
    def get_branch(self, branch_name: str) -> BranchBase:
        return BranchLocalStorage(branch_name, settings=self._settings)

    def _get_latest_node_id(self, error_msg: str) -> IdType:
        id = next(
            find_nodes_ids_by_filter(
                self._settings.storage.location,
                project_name=self._settings.project,
                descending=True,
            ),
            None,
        )
        if id is None:
            raise QFileNotFoundException(f"There is no {error_msg}")
        return id

    def get_snapshot(self, id: IdType | None = None) -> SnapshotBase:
        if id is None:
            id = self._get_latest_node_id("snapshot")
        return SnapshotLocalStorage(id, settings=self._settings)

    def get_node(self, id: IdType | None = None) -> NodeBase:
        if id is None:
            id = self._get_latest_node_id("node")
        return NodeLocalStorage(id, settings=self._settings)

    def get_latest_snapshots(
        self,
        pages_filter: PageFilter,
        search_filter: SearchWithIdFilter | None = None,
        descending: bool = False,
    ) -> tuple[int, Sequence[SnapshotBase]]:
        return BranchLocalStorage(
            "main", settings=self._settings
        ).get_latest_snapshots(
            pages_filter=pages_filter,
            search_filter=search_filter,
            descending=descending,
        )

    def get_latest_nodes(
        self,
        pages_filter: PageFilter,
        search_filter: SearchWithIdFilter | None = None,
        descending: bool = False,
    ) -> tuple[int, Sequence[NodeBase]]:
        return BranchLocalStorage(
            "main", settings=self._settings
        ).get_latest_nodes(
            pages_filter=pages_filter,
            search_filter=search_filter,
            descending=descending,
        )

    def search_snapshot(
        self,
        search_filter: SearchWithIdFilter,
        data_path: Sequence[str | int],
        descending: bool = False,
    ) -> Any:
        _, data = self.search_snapshots_data(
            search_filter=search_filter,
            pages_filter=PageFilter(page=1, per_page=1),
            data_path=data_path,
            descending=descending,
            filter_no_change=False,
        )
        if len(data) == 1:
            return data[0]
        return data

    def search_snapshots_data(
        self,
        *,
        pages_filter: PageFilter,
        search_filter: SearchWithIdFilter | None = None,
        data_path: Sequence[str | int],
        filter_no_change: bool = True,
        descending: bool = False,
    ) -> tuple[int, Sequence[SnapshotSearchResult]]:
        return BranchLocalStorage(
            "main", settings=self._settings
        ).search_snapshots_data(
            search_filter=search_filter,
            pages_filter=pages_filter,
            data_path=data_path,
            descending=descending,
            filter_no_change=filter_no_change,
        )
