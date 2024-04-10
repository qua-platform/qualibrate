from typing import Optional

from qualibrate.api.core.domain.bases.node import NodeBase, NodeLoadType
from qualibrate.api.core.domain.bases.snapshot import (
    SnapshotBase,
    SnapshotLoadType,
)
from qualibrate.api.core.domain.bases.storage import DataFileStorage
from qualibrate.api.core.domain.local_storage.snapshot import (
    SnapshotLocalStorage,
)
from qualibrate.api.core.types import IdType

__all__ = ["NodeLocalStorage"]


class NodeLocalStorage(NodeBase):
    def __init__(self, node_id: IdType):
        super().__init__(node_id, SnapshotLocalStorage(node_id))

    def load(self, load_type: NodeLoadType) -> None:
        if self._load_type == NodeLoadType.Full:
            return
        self._snapshot.load(SnapshotLoadType.Metadata)
        if load_type < NodeLoadType.Full:
            return
        self._fill_storage()

    @property
    def snapshot(self) -> Optional[SnapshotBase]:
        return self._snapshot

    @property
    def storage(self) -> Optional[DataFileStorage]:
        return self._storage
