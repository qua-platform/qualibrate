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
    find_n_latest_nodes_ids,
)
from qualibrate_app.api.core.types import IdType
from qualibrate_app.api.exceptions.classes.storage import QFileNotFoundException

__all__ = ["RootLocalStorage"]


class RootLocalStorage(RootBase):
    def get_branch(self, branch_name: str) -> BranchBase:
        return BranchLocalStorage(branch_name, settings=self._settings)

    def _get_latest_node_id(self, error_msg: str) -> IdType:
        id = next(
            find_n_latest_nodes_ids(
                self._settings.storage.location,
                1,
                1,
                self._settings.project,
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
        page: int = 1,
        per_page: int = 50,
        reverse: bool = False,
    ) -> tuple[int, Sequence[SnapshotBase]]:
        return BranchLocalStorage(
            "main", settings=self._settings
        ).get_latest_snapshots(page, per_page, reverse)

    def get_latest_nodes(
        self,
        page: int = 1,
        per_page: int = 50,
        reverse: bool = False,
    ) -> tuple[int, Sequence[NodeBase]]:
        return BranchLocalStorage(
            "main", settings=self._settings
        ).get_latest_nodes(page, per_page, reverse)

    def search_snapshot(
        self, snapshot_id: IdType, data_path: Sequence[str | int]
    ) -> Any:
        return self.get_snapshot(snapshot_id).search(data_path, load=True)
