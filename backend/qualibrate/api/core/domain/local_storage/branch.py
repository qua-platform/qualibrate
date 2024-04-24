from datetime import datetime
from pathlib import Path
from typing import Optional, Sequence, Tuple

from qualibrate.api.core.domain.bases.branch import BranchBase, BranchLoadType
from qualibrate.api.core.domain.bases.node import NodeBase, NodeLoadType
from qualibrate.api.core.domain.bases.snapshot import (
    SnapshotBase,
    SnapshotLoadType,
)
from qualibrate.api.core.domain.local_storage.node import NodeLocalStorage
from qualibrate.api.core.domain.local_storage.snapshot import (
    SnapshotLocalStorage,
)
from qualibrate.api.core.domain.local_storage.utils.node_utils import (
    find_latest_node_id,
    find_n_latest_nodes_ids,
)
from qualibrate.api.core.models.branch import Branch as BranchModel
from qualibrate.api.core.types import DocumentType, IdType
from qualibrate.api.exceptions.classes.storage import QFileNotFoundException
from qualibrate.config import get_settings

__all__ = ["BranchLocalStorage"]


class BranchLocalStorage(BranchBase):
    def __init__(self, name: str, content: Optional[DocumentType] = None):
        # Temporary branch name has no effect
        super().__init__(name, content)

    @property
    def created_at(self) -> datetime:
        settings = get_settings()
        return datetime.fromtimestamp(
            Path(settings.user_storage).stat().st_mtime
        ).astimezone()

    def load(self, load_type: BranchLoadType) -> None:
        pass

    def _get_latest_node_id(self, error_msg: str) -> IdType:
        settings = get_settings()
        id = next(find_n_latest_nodes_ids(settings.user_storage, 1, 1), None)
        if id is None:
            raise QFileNotFoundException(f"There is no {error_msg}")
        return id

    def get_snapshot(self, id: Optional[IdType] = None) -> SnapshotBase:
        if id is None:
            id = self._get_latest_node_id("snapshots")
        return SnapshotLocalStorage(id)

    def get_node(self, id: Optional[IdType] = None) -> NodeBase:
        if id is None:
            id = self._get_latest_node_id("nodes")
        return NodeLocalStorage(id)

    def get_latest_snapshots(
        self,
        page: int = 0,
        per_page: int = 50,
        reverse: bool = False,
    ) -> Tuple[int, Sequence[SnapshotBase]]:
        # TODO: use reverse
        settings = get_settings()
        ids = find_n_latest_nodes_ids(settings.user_storage, page, per_page)
        snapshots = [SnapshotLocalStorage(id) for id in ids]
        for snapshot in snapshots:
            snapshot.load(SnapshotLoadType.Metadata)
        total = find_latest_node_id(settings.user_storage)
        return total, snapshots

    def get_latest_nodes(
        self,
        page: int = 0,
        per_page: int = 50,
        reverse: bool = False,
    ) -> Tuple[int, Sequence[NodeBase]]:
        # TODO: use reverse
        settings = get_settings()
        ids = find_n_latest_nodes_ids(settings.user_storage, page, per_page)
        nodes = [NodeLocalStorage(id) for id in ids]
        for node in nodes:
            node.load(NodeLoadType.Full)
        total = find_latest_node_id(settings.user_storage)
        return total, nodes

    def dump(self) -> BranchModel:
        return BranchModel(
            id=1,
            created_at=self.created_at,
            name=self._name,
            snapshot_id=-1,
        )
