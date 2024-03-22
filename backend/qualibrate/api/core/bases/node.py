from enum import IntEnum
from abc import ABC, abstractmethod


__all__ = ["NodeBase", "NodeLoadType"]

from typing import Optional

from qualibrate.api.core.bases.snapshot import SnapshotBase
from qualibrate.api.core.bases.storage import DataFileStorage


class NodeLoadType(IntEnum):
    Empty = 0
    Snapshot = 1
    Full = 2


class NodeBase(ABC):
    def __init__(self) -> None:
        self._load_type = NodeLoadType.Empty
        self._snapshot: SnapshotBase

    @property
    def load_type(self) -> NodeLoadType:
        return self._load_type

    @abstractmethod
    def load(self, load_type: NodeLoadType) -> None:
        pass

    @property
    @abstractmethod
    def snapshot(self) -> Optional[SnapshotBase]:
        pass

    @property
    @abstractmethod
    def storage(self) -> Optional[DataFileStorage]:
        pass
