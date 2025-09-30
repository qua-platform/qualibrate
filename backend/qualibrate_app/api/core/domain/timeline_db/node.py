from qualibrate_config.models import QualibrateConfig

from qualibrate_app.api.core.domain.bases.node import NodeBase
from qualibrate_app.api.core.domain.timeline_db.snapshot import (
    SnapshotTimelineDb,
)
from qualibrate_app.api.core.types import DocumentType, IdType

__all__ = ["NodeTimelineDb"]


class NodeTimelineDb(NodeBase):
    def __init__(
        self,
        node_id: IdType,
        snapshot_content: DocumentType | None = None,
        *,
        settings: QualibrateConfig,
    ):
        super().__init__(
            node_id,
            SnapshotTimelineDb(node_id, snapshot_content, settings=settings),
            settings,
        )
