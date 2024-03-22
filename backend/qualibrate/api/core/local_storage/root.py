from typing import Any, Optional

from qualibrate.api.core.local_storage.utils.node_utils import (
    find_latest_node_id,
)
from qualibrate.api.core.types import DocumentSequenceType, IdType
from qualibrate.api.core.bases.root import RootBase
from qualibrate.api.core.bases.node import NodeBase
from qualibrate.api.core.bases.branch import BranchBase
from qualibrate.api.core.bases.snapshot import SnapshotBase
from qualibrate.api.core.local_storage.node import NodeLocalStorage
from qualibrate.api.core.local_storage.branch import BranchLocalStorage
from qualibrate.api.core.local_storage.snapshot import SnapshotLocalStorage
from qualibrate.config import get_settings


__all__ = ["RootLocalStorage"]


class RootLocalStorage(RootBase):
    def get_branch(self, branch_name: str) -> BranchBase:
        return BranchLocalStorage(branch_name)

    def _get_latest_node_id(self) -> IdType:
        settings = get_settings()
        return find_latest_node_id(settings.user_storage)

    def get_snapshot(self, id: Optional[IdType] = None) -> SnapshotBase:
        if id is None:
            id = self._get_latest_node_id()
        return SnapshotLocalStorage(id)

    def get_node(self, id: Optional[IdType] = None) -> NodeBase:
        if id is None:
            id = self._get_latest_node_id()
        return NodeLocalStorage(id)

    def get_latest_snapshots(self, num: int = 50) -> DocumentSequenceType:
        raise NotImplementedError

    def get_latest_nodes(self, num: int = 50) -> DocumentSequenceType:
        raise NotImplementedError

    def search_snapshot(self, snapshot_id: IdType, data_path: str) -> Any:
        pass
