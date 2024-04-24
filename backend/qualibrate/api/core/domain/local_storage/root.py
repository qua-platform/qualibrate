from typing import Any, Optional, Sequence, Tuple, Union

from qualibrate.api.core.domain.bases.branch import BranchBase
from qualibrate.api.core.domain.bases.node import NodeBase
from qualibrate.api.core.domain.bases.root import RootBase
from qualibrate.api.core.domain.bases.snapshot import SnapshotBase
from qualibrate.api.core.domain.local_storage.branch import BranchLocalStorage
from qualibrate.api.core.domain.local_storage.node import NodeLocalStorage
from qualibrate.api.core.domain.local_storage.snapshot import (
    SnapshotLocalStorage,
)
from qualibrate.api.core.domain.local_storage.utils.node_utils import (
    find_n_latest_nodes_ids,
)
from qualibrate.api.core.types import IdType
from qualibrate.api.exceptions.classes.storage import QFileNotFoundException
from qualibrate.config import get_settings

__all__ = ["RootLocalStorage"]


class RootLocalStorage(RootBase):
    def get_branch(self, branch_name: str) -> BranchBase:
        return BranchLocalStorage(branch_name)

    def _get_latest_node_id(self, error_msg: str) -> IdType:
        settings = get_settings()
        id = next(find_n_latest_nodes_ids(settings.user_storage, 1, 1), None)
        if id is None:
            raise QFileNotFoundException(f"There is no {error_msg}")
        return id

    def get_snapshot(self, id: Optional[IdType] = None) -> SnapshotBase:
        if id is None:
            id = self._get_latest_node_id("snapshot")
        return SnapshotLocalStorage(id)

    def get_node(self, id: Optional[IdType] = None) -> NodeBase:
        if id is None:
            id = self._get_latest_node_id("node")
        return NodeLocalStorage(id)

    def get_latest_snapshots(
        self,
        page: int = 1,
        per_page: int = 50,
        reverse: bool = False,
    ) -> Tuple[int, Sequence[SnapshotBase]]:
        return BranchLocalStorage("main").get_latest_snapshots(
            page, per_page, reverse
        )

    def get_latest_nodes(
        self,
        page: int = 1,
        per_page: int = 50,
        reverse: bool = False,
    ) -> Tuple[int, Sequence[NodeBase]]:
        return BranchLocalStorage("main").get_latest_nodes(
            page, per_page, reverse
        )

    def search_snapshot(
        self, snapshot_id: IdType, data_path: Sequence[Union[str, int]]
    ) -> Any:
        return self.get_snapshot(snapshot_id).search(data_path, load=True)
