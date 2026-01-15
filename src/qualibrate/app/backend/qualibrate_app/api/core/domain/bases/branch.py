from abc import ABC, abstractmethod
from collections.abc import Sequence
from datetime import datetime
from enum import IntEnum

from qualibrate_config.models import QualibrateConfig

from qualibrate_app.api.core.domain.bases.base_with_settings import (
    DomainWithConfigBase,
)
from qualibrate_app.api.core.domain.bases.i_dump import IDump
from qualibrate_app.api.core.domain.bases.node import NodeBase
from qualibrate_app.api.core.domain.bases.snapshot import SnapshotBase
from qualibrate_app.api.core.models.branch import Branch as BranchModel
from qualibrate_app.api.core.models.snapshot import SnapshotSearchResult
from qualibrate_app.api.core.types import (
    DocumentType,
    IdType,
    PageFilter,
    SearchWithIdFilter,
)

__all__ = ["BranchBase", "BranchLoadType"]


class BranchLoadType(IntEnum):
    Empty = 0
    Full = 1


class BranchBase(DomainWithConfigBase, IDump, ABC):
    def __init__(
        self,
        name: str,
        content: DocumentType | None = None,
        *,
        settings: QualibrateConfig,
    ):
        super().__init__(settings)
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
    def created_at(self) -> datetime | None:
        pass

    @abstractmethod
    def load(self, load_type: BranchLoadType) -> None:
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

    def dump(self) -> BranchModel:
        return BranchModel(
            name=self._name,
            **self.content,
        )

    def __repr__(self) -> str:
        return f"{self.__class__.__name__}(name={self.name!r})"
