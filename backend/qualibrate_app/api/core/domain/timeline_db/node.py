from typing import Optional

from qualibrate_app.api.core.domain.bases.node import NodeBase
from qualibrate_app.api.core.domain.timeline_db.snapshot import SnapshotTimelineDb
from qualibrate_app.api.core.types import DocumentType, IdType

__all__ = ["NodeTimelineDb"]

from qualibrate_app.config import QualibrateSettings


class NodeTimelineDb(NodeBase):
    def __init__(
        self,
        node_id: IdType,
        snapshot_content: Optional[DocumentType] = None,
        *,
        settings: QualibrateSettings,
    ):
        super().__init__(
            node_id,
            SnapshotTimelineDb(node_id, snapshot_content, settings=settings),
            settings,
        )
