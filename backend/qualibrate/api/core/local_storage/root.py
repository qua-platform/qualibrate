from typing import Any, Optional

from qualibrate.api.core.types import DocumentSequenceType, IdType
from qualibrate.api.core.bases.root import RootBase
from qualibrate.api.core.bases.node import NodeBase
from qualibrate.api.core.bases.branch import BranchBase
from qualibrate.api.core.bases.snapshot import SnapshotBase
from qualibrate.api.core.local_storage.node import NodeLocalStorage
from qualibrate.api.core.local_storage.utils.node_utils import (
    find_n_latest_nodes_ids,
)
from qualibrate.api.core.local_storage.branch import BranchLocalStorage
from qualibrate.api.core.local_storage.snapshot import SnapshotLocalStorage
from qualibrate.config import get_settings


__all__ = ["RootLocalStorage"]


class RootLocalStorage(RootBase):
    def get_branch(self, branch_name: str) -> BranchBase:
        return BranchLocalStorage(branch_name)

    def _get_latest_node_id(self, error_msg: str) -> IdType:
        settings = get_settings()
        id = next(find_n_latest_nodes_ids(settings.user_storage, 1), None)
        if id is None:
            raise OSError(f"There is no {error_msg}")
        return id

    def get_snapshot(self, id: Optional[IdType] = None) -> SnapshotBase:
        if id is None:
            id = self._get_latest_node_id("snapshot")
        return SnapshotLocalStorage(id)

    def get_node(self, id: Optional[IdType] = None) -> NodeBase:
        if id is None:
            id = self._get_latest_node_id("node")
        return NodeLocalStorage(id)

    def get_latest_snapshots(self, num: int = 50) -> DocumentSequenceType:
        return BranchLocalStorage("main").get_latest_snapshots(num)

    def get_latest_nodes(self, num: int = 50) -> DocumentSequenceType:
        return BranchLocalStorage("main").get_latest_nodes(num)

    def search_snapshot(self, snapshot_id: IdType, data_path: str) -> Any:
        pass
