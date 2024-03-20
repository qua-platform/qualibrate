from abc import ABC, abstractmethod
from datetime import datetime
from enum import IntEnum


__all__ = ["BranchBase", "BranchLoadType"]

from typing import Optional

from qualibrate.api.core.bases.node import NodeBase
from qualibrate.api.core.bases.snapshot import SnapshotBase
from qualibrate.api.core.types import DocumentType, DocumentSequenceType, IdType


class BranchLoadType(IntEnum):
    Empty = 0
    Full = 1


class BranchBase(ABC):
    def __init__(self, name: str, content: Optional[DocumentType] = None):
        self._name = name
        if content is None:
            self.content = {}
            self._load_type = BranchLoadType.Empty
            return
        self.content = dict(content)
        self._load_type = BranchLoadType.Full

    @property
    def load_type(self) -> BranchLoadType:
        return self._load_type

    @property
    def name(self) -> str:
        return self._name

    @property
    @abstractmethod
    def created_at(self) -> Optional[datetime]:
        pass

    @abstractmethod
    def load(self, load_type: BranchLoadType) -> None:
        pass

    @abstractmethod
    def get_snapshot(self, id: IdType) -> SnapshotBase:
        pass

    @abstractmethod
    def get_node(self, id: IdType) -> NodeBase:
        pass

    @abstractmethod
    def get_latest_snapshots(
        self, num_snapshots: int = 50
    ) -> DocumentSequenceType:
        pass
