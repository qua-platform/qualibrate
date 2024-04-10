from typing import Optional, cast

from qualibrate.api.core.domain.bases.node import NodeBase, NodeLoadType
from qualibrate.api.core.domain.bases.snapshot import SnapshotLoadType
from qualibrate.api.core.domain.bases.storage import DataFileStorage
from qualibrate.api.core.domain.timeline_db.snapshot import SnapshotTimelineDb
from qualibrate.api.core.types import DocumentType, IdType

__all__ = ["NodeTimelineDb"]


class NodeTimelineDb(NodeBase):
    def __init__(
        self, node_id: IdType, snapshot_content: Optional[DocumentType] = None
    ):
        super().__init__(node_id, SnapshotTimelineDb(node_id, snapshot_content))
        self._storage: Optional[DataFileStorage] = None

    @property
    def load_type(self) -> NodeLoadType:
        return self._load_type

    def load(self, load_type: NodeLoadType) -> None:
        if self._load_type == NodeLoadType.Full:
            return
        self._snapshot.load(SnapshotLoadType.Metadata)
        if load_type < NodeLoadType.Full:
            return
        self._fill_storage()

    @property
    def snapshot(self) -> Optional[SnapshotTimelineDb]:
        return cast(SnapshotTimelineDb, self._snapshot)

    @property
    def storage(self) -> Optional[DataFileStorage]:
        return self._storage
