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
from qualibrate_app.api.core.types import DocumentType, IdType

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
        page: int = 0,
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

    def dump(self) -> BranchModel:
        return BranchModel(
            name=self._name,
            **self.content,
        )
