from abc import ABC, abstractmethod
from typing import Any, Optional, Sequence, Tuple, Union

from qualibrate.api.core.domain.bases.branch import BranchBase
from qualibrate.api.core.domain.bases.node import NodeBase
from qualibrate.api.core.domain.bases.snapshot import SnapshotBase
from qualibrate.api.core.types import IdType

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
    def get_latest_snapshots(
        self,
        page: int = 1,
        per_page: int = 50,
        reverse: bool = False,
    ) -> Tuple[int, Sequence[SnapshotBase]]:
        pass

    @abstractmethod
    def get_latest_nodes(
        self,
        page: int = 1,
        per_page: int = 50,
        reverse: bool = False,
    ) -> Tuple[int, Sequence[NodeBase]]:
        pass

    @abstractmethod
    def search_snapshot(
        self,
        snapshot_id: IdType,
        data_path: Sequence[Union[str, int]],
    ) -> Any:
        pass
