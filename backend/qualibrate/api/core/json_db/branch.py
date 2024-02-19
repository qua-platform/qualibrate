from enum import IntEnum
from typing import Optional

from qualibrate.api.core.types import DocumentType
from qualibrate.api.core.json_db.snapshot import SnapshotJsonDb

__all__ = ["Branch"]


class BranchLoadType(IntEnum):
    Empty = 0
    Full = 1


class Branch:
    def __init__(self, name: str, content: Optional[DocumentType] = None):
        self._name = name
        self.content = content
        self.load_type: BranchLoadType = (
            BranchLoadType.Empty if content is not None else BranchLoadType.Full
        )

    def load(self) -> None:
        if self.load_type == BranchLoadType.Full:
            return

    def get_last_snapshots(
        self, branch_name: str, num_snapshots: int
    ) -> list[DocumentType]:
        """Retrieve last num_snapshots from this branch"""
        # TODO
        return []

    def get_snapshot(self, id: int) -> SnapshotJsonDb:
        return SnapshotJsonDb(id=id)
