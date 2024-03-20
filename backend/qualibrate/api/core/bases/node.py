from enum import IntEnum
from abc import ABC, abstractmethod


__all__ = ["NodeBase", "NodeLoadType"]


class NodeLoadType(IntEnum):
    Empty = 0
    Snapshot = 1
    Full = 2


class NodeBase(ABC):
    @abstractmethod
    def load(self, load_type: NodeLoadType) -> None:
        pass
