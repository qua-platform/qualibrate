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
from qualibrate_app.api.core.models.snapshot import SnapshotSearchResult
from qualibrate_app.api.core.types import (
    IdType,
    PageFilter,
    SearchWithIdFilter,
)

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
        pages_filter: PageFilter,
        search_filter: SearchWithIdFilter | None = None,
        descending: bool = False,
    ) -> tuple[int, Sequence[SnapshotBase]]:
        pass

    @abstractmethod
    def get_latest_nodes(
        self,
        pages_filter: PageFilter,
        search_filter: SearchWithIdFilter | None = None,
        descending: bool = False,
    ) -> tuple[int, Sequence[NodeBase]]:
        pass

    @abstractmethod
    def search_snapshot(
        self,
        search_filter: SearchWithIdFilter,
        data_path: Sequence[str | int],
        descending: bool = False,
    ) -> Any:
        pass

    @abstractmethod
    def search_snapshots_data(
        self,
        *,
        pages_filter: PageFilter,
        search_filter: SearchWithIdFilter | None = None,
        data_path: Sequence[str | int],
        filter_no_change: bool = True,
        descending: bool = False,
    ) -> tuple[int, Sequence[SnapshotSearchResult]]:
        pass
