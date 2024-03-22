from datetime import datetime
from pathlib import Path
from typing import Optional

from qualibrate.api.core.bases.branch import BranchBase, BranchLoadType
from qualibrate.api.core.bases.node import NodeBase
from qualibrate.api.core.bases.snapshot import SnapshotBase
from qualibrate.api.core.local_storage.node import NodeLocalStorage
from qualibrate.api.core.local_storage.snapshot import SnapshotLocalStorage
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

    def get_snapshot(self, id: Optional[IdType] = None) -> SnapshotBase:
        if id is None:
            raise NotImplementedError
        return SnapshotLocalStorage(id)

    def get_node(self, id: Optional[IdType] = None) -> NodeBase:
        if id is None:
            raise NotImplementedError
        return NodeLocalStorage(id)

    def get_latest_snapshots(self, num: int = 50) -> DocumentSequenceType:
        raise NotImplementedError

    def get_latest_nodes(self, num: int = 50) -> DocumentSequenceType:
        raise NotImplementedError
