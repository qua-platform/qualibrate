from abc import ABC, abstractmethod
from collections.abc import Sequence
from typing import Any

from qualibrate_config.models import QualibrateConfig

from qualibrate_app.api.core.domain.bases.base_with_settings import (
    DomainWithConfigBase,
)
from qualibrate_app.api.core.domain.bases.branch import BranchBase
from qualibrate_app.api.core.domain.bases.node import NodeBase
from qualibrate_app.api.core.domain.bases.snapshot import SnapshotBase
from qualibrate_app.api.core.types import IdType

__all__ = ["RootBase"]


class RootBase(DomainWithConfigBase, ABC):
    def __init__(self, settings: QualibrateConfig):
        super().__init__(settings)

    @abstractmethod
    def get_branch(self, branch_name: str) -> BranchBase:
        pass

    @abstractmethod
    def get_snapshot(self, id: IdType | None = None) -> SnapshotBase:
        pass

    @abstractmethod
    def get_node(self, id: IdType | None = None) -> NodeBase:
        pass

    @abstractmethod
    def get_latest_snapshots(
        self,
        page: int = 1,
        per_page: int = 50,
        reverse: bool = False,
    ) -> tuple[int, Sequence[SnapshotBase]]:
        pass

    @abstractmethod
    def get_latest_nodes(
        self,
        page: int = 1,
        per_page: int = 50,
        reverse: bool = False,
    ) -> tuple[int, Sequence[NodeBase]]:
        pass

    @abstractmethod
    def search_snapshot(
        self,
        snapshot_id: IdType,
        data_path: Sequence[str | int],
    ) -> Any:
        pass
