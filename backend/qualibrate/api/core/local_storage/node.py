from typing import Optional

from qualibrate.api.core.bases.node import NodeBase, NodeLoadType
from qualibrate.api.core.bases.snapshot import SnapshotBase, SnapshotLoadType
from qualibrate.api.core.bases.storage import DataFileStorage
from qualibrate.api.core.local_storage.snapshot import SnapshotLocalStorage
from qualibrate.api.core.types import IdType

__all__ = ["NodeLoadType"]


class NodeLocalStorage(NodeBase):
    def __init__(self, node_id: IdType):
        super().__init__(node_id)
        self._storage: Optional[DataFileStorage] = None
        self._snapshot = SnapshotLocalStorage(node_id)

    def load(self, load_type: NodeLoadType) -> None:
        if self._load_type == NodeLoadType.Full:
            return
        try:
            self._snapshot.load(SnapshotLoadType.Metadata)
        except FileNotFoundError:
            pass
        if load_type < NodeLoadType.Full:
            return
        self._fill_storage()

    @property
    def snapshot(self) -> Optional[SnapshotBase]:
        return self._snapshot

    @property
    def storage(self) -> Optional[DataFileStorage]:
        return self._storage
