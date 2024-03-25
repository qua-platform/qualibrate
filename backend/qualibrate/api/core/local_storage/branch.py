from datetime import datetime
from pathlib import Path
from typing import Optional

from qualibrate.api.core.bases.branch import BranchBase, BranchLoadType
from qualibrate.api.core.bases.node import NodeBase, NodeLoadType
from qualibrate.api.core.bases.snapshot import SnapshotBase, SnapshotLoadType
from qualibrate.api.core.local_storage.node import NodeLocalStorage
from qualibrate.api.core.local_storage.snapshot import SnapshotLocalStorage
from qualibrate.api.core.local_storage.utils.node_utils import (
    find_n_latest_nodes_ids,
)
from qualibrate.api.core.types import DocumentSequenceType, IdType, DocumentType
from qualibrate.config import get_settings


class BranchLocalStorage(BranchBase):
    def __init__(self, name: str, content: Optional[DocumentType] = None):
        # Temporary branch name has no effect
        super().__init__(name, content)

    @property
    def created_at(self) -> Optional[datetime]:
        settings = get_settings()
        return datetime.fromtimestamp(
            Path(settings.user_storage).stat().st_mtime
        )

    def load(self, load_type: BranchLoadType) -> None:
        pass

    def _get_latest_node_id(self, error_msg: str) -> IdType:
        settings = get_settings()
        id = next(find_n_latest_nodes_ids(settings.user_storage, 1), None)
        if id is None:
            raise OSError(f"There is no {error_msg}")
        return id

    def get_snapshot(self, id: Optional[IdType] = None) -> SnapshotBase:
        if id is None:
            id = self._get_latest_node_id("snapshots")
        return SnapshotLocalStorage(id)

    def get_node(self, id: Optional[IdType] = None) -> NodeBase:
        if id is None:
            id = self._get_latest_node_id("nodes")
        return NodeLocalStorage(id)

    def get_latest_snapshots(self, num: int = 50) -> DocumentSequenceType:
        settings = get_settings()
        ids = find_n_latest_nodes_ids(settings.user_storage, num)
        snapshots = [SnapshotLocalStorage(id) for id in ids]
        for snapshot in snapshots:
            try:
                snapshot.load(SnapshotLoadType.Metadata)
            except FileNotFoundError:
                pass
        return [snapshot.content for snapshot in snapshots]

    def get_latest_nodes(self, num: int = 50) -> DocumentSequenceType:
        settings = get_settings()
        ids = find_n_latest_nodes_ids(settings.user_storage, num)
        nodes = [NodeLocalStorage(id) for id in ids]
        for node in nodes:
            try:
                node.load(NodeLoadType.Full)
            except FileNotFoundError:
                pass
        return [node.dump() for node in nodes]
