from qualibrate_config.models import QualibrateConfig

from qualibrate_app.api.core.domain.bases.node import NodeBase
from qualibrate_app.api.core.domain.local_storage.snapshot import (
    SnapshotLocalStorage,
)
from qualibrate_app.api.core.types import IdType

__all__ = ["NodeLocalStorage"]


class NodeLocalStorage(NodeBase):
    def __init__(self, node_id: IdType, settings: QualibrateConfig):
        super().__init__(
            node_id, SnapshotLocalStorage(node_id, settings=settings), settings
        )
