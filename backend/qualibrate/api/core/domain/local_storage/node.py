
from qualibrate.api.core.domain.bases.node import NodeBase
from qualibrate.api.core.domain.local_storage.snapshot import (
    SnapshotLocalStorage,
)
from qualibrate.api.core.types import IdType

__all__ = ["NodeLocalStorage"]


class NodeLocalStorage(NodeBase):
    def __init__(self, node_id: IdType):
        super().__init__(node_id, SnapshotLocalStorage(node_id))
