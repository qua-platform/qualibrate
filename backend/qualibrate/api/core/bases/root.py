from abc import ABC, abstractmethod
from typing import Any, Optional

from qualibrate.api.core.types import DocumentSequenceType, IdType
from qualibrate.api.core.bases.node import NodeBase
from qualibrate.api.core.bases.branch import BranchBase
from qualibrate.api.core.bases.snapshot import SnapshotBase


__all__ = ["RootBase"]


class RootBase(ABC):
    @abstractmethod
    def get_branch(self, branch_name: str) -> BranchBase:
        pass

    @abstractmethod
    def get_snapshot(self, id: Optional[IdType] = None) -> SnapshotBase:
        pass

    @abstractmethod
    def get_node(self, id: Optional[IdType] = None) -> NodeBase:
        pass

    @abstractmethod
    def get_latest_snapshots(self, num: int = 50) -> DocumentSequenceType:
        pass

    @abstractmethod
    def get_latest_nodes(self, num: int = 50) -> DocumentSequenceType:
        pass

    @abstractmethod
    def search_snapshot(self, snapshot_id: IdType, data_path: str) -> Any:
        pass
