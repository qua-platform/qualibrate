from abc import ABC, abstractmethod
from datetime import datetime
from enum import IntEnum
from typing import Any, ClassVar, Mapping, Optional, Union

from qualibrate.api.core.bases.i_dump import IDump
from qualibrate.api.core.types import DocumentSequenceType, DocumentType, IdType

__all__ = ["SnapshotBase", "SnapshotLoadType"]

from qualibrate.api.core.utils.find_utils import get_subpath_value_on_any_depth


class SnapshotLoadType(IntEnum):
    Empty = 0
    Minified = 1
    Metadata = 2
    Data = 3
    Full = 4


class SnapshotBase(IDump, ABC):
    _items_keys: ClassVar[tuple[str, ...]] = ("data", "metadata")

    def __init__(
        self,
        id: IdType,
        content: Optional[DocumentType] = None,
    ):
        self._id = id
        if content is None:
            self._load_type = SnapshotLoadType.Empty
            self.content = {}
            return
        specified_items_keys = {
            key: key in content for key in self.__class__._items_keys
        }
        if any(specified_items_keys.values()):
            if all(specified_items_keys.values()):
                self._load_type = SnapshotLoadType.Full
            elif specified_items_keys["data"]:
                self._load_type = SnapshotLoadType.Data
            else:
                self._load_type = SnapshotLoadType.Metadata
        else:
            self._load_type = SnapshotLoadType.Minified
        self.content = dict(content)

    @abstractmethod
    def load(self, load_type: SnapshotLoadType) -> None:
        pass

    @property
    def load_type(self) -> SnapshotLoadType:
        return self._load_type

    @property
    def id(self) -> Optional[IdType]:
        return self._id

    @property
    @abstractmethod
    def created_at(self) -> Optional[datetime]:
        pass

    @property
    @abstractmethod
    def parents(self) -> Optional[list[IdType]]:
        pass

    @property
    def metadata(self) -> Optional[DocumentType]:
        return self.content.get("metadata")

    @property
    def data(self) -> Optional[DocumentType]:
        return self.content.get("data")

    @abstractmethod
    def search(
        self,
        search_path: list[Union[str, int]],
        load: bool = False,
    ) -> Optional[DocumentSequenceType]:
        pass

    def search_recursive(
        self, target_key: str, load: bool = False
    ) -> Optional[DocumentSequenceType]:
        if self._load_type < SnapshotLoadType.Data and not load:
            return None
        self.load(SnapshotLoadType.Data)
        data = self.data
        if data is None:
            return None
        return get_subpath_value_on_any_depth(data, target_key)

    @abstractmethod
    def get_latest_snapshots(
        self, num_snapshots: int = 50
    ) -> DocumentSequenceType:
        pass

    @abstractmethod
    def compare_by_id(
        self, other_snapshot_int: int
    ) -> Mapping[str, Mapping[str, Any]]:
        pass

    def dump(self) -> DocumentType:
        return self.content
