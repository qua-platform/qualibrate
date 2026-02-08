from abc import ABC, abstractmethod
from collections.abc import Mapping, Sequence
from datetime import datetime
from enum import IntEnum
from typing import Any, ClassVar

from qualibrate_config.models import QualibrateConfig

from qualibrate.app.api.core.domain.bases.base_with_settings import (
    DomainWithConfigBase,
)
from qualibrate.app.api.core.domain.bases.i_dump import IDump
from qualibrate.app.api.core.domain.bases.load_type_flag import LoadTypeFlag
from qualibrate.app.api.core.models.snapshot import MachineSearchResults
from qualibrate.app.api.core.models.snapshot import Snapshot as SnapshotModel
from qualibrate.app.api.core.types import (
    DocumentType,
    IdType,
    PageFilter,
)
from qualibrate.app.api.core.utils.find_utils import (
    get_subpath_value_on_any_depth,
)

__all__ = [
    "SnapshotBase",
    "SnapshotLoadType",
    "SnapshotLoadTypeFlag",
    "SnapshotLoadTypeToLoadTypeFlag",
]


class SnapshotLoadType(IntEnum):
    Empty = 0
    Minified = 1
    Metadata = 2
    Data = 3
    Full = 4


class SnapshotLoadTypeFlag(LoadTypeFlag):
    Empty = 0
    Minified = Empty | 2**0
    Metadata = Minified | 2**1
    DataWithoutRefs = Minified | 2**2
    DataWithMachine = DataWithoutRefs | 2**3
    DataWithResults = DataWithoutRefs | 2**4
    DataWithResultsWithImgs = DataWithResults | 2**5

    Full = 2**9 | Empty | Minified | Metadata | DataWithoutRefs | DataWithMachine | DataWithResults

    def is_set(self, field: "SnapshotLoadTypeFlag") -> bool:
        return self._is_set(field)


SnapshotLoadTypeToLoadTypeFlag = {
    SnapshotLoadType.Empty: SnapshotLoadTypeFlag.Empty,
    SnapshotLoadType.Minified: SnapshotLoadTypeFlag.Minified,
    SnapshotLoadType.Metadata: SnapshotLoadTypeFlag.Metadata,
    SnapshotLoadType.Data: (
        SnapshotLoadTypeFlag.Metadata
        | SnapshotLoadTypeFlag.DataWithMachine
        | SnapshotLoadTypeFlag.DataWithResultsWithImgs
    ),
    SnapshotLoadType.Full: SnapshotLoadTypeFlag.Full,
}


class SnapshotBase(DomainWithConfigBase, IDump, ABC):
    _items_keys: ClassVar[tuple[str, ...]] = ("data", "metadata")

    def __init__(
        self,
        id: IdType,
        content: DocumentType | None = None,
        *,
        settings: QualibrateConfig,
    ):
        super().__init__(settings)
        self._id = id
        if content is None:
            self._load_type_flag = SnapshotLoadTypeFlag.Empty
            self.content = {}
            return
        self._load_type_flag = self._load_type_flag_from_content(content)
        self.content = dict(content)

    def _load_type_flag_from_content(self, content: DocumentType) -> SnapshotLoadTypeFlag:
        load_type_flag = SnapshotLoadTypeFlag.Empty
        if "id" in content:
            load_type_flag |= SnapshotLoadTypeFlag.Minified
        if content.get("metadata"):
            load_type_flag |= SnapshotLoadTypeFlag.Metadata
        if data := content.get("data"):
            load_type_flag |= SnapshotLoadTypeFlag.DataWithoutRefs
            if not isinstance(data, Mapping):
                return load_type_flag
            if isinstance(data.get("quam"), dict) or isinstance(data.get("machine"), dict):
                load_type_flag |= SnapshotLoadTypeFlag.DataWithMachine
            if isinstance(data.get("results"), dict):
                load_type_flag |= SnapshotLoadTypeFlag.DataWithResults
        return load_type_flag

    @abstractmethod
    def load_from_flag(self, load_type_flag: SnapshotLoadTypeFlag) -> None:
        pass

    @property
    def load_type_flag(self) -> SnapshotLoadTypeFlag:
        return self._load_type_flag

    @property
    def id(self) -> IdType | None:
        return self._id

    @property
    @abstractmethod
    def created_at(self) -> datetime | None:
        pass

    @property
    @abstractmethod
    def parents(self) -> list[IdType] | None:
        pass

    @property
    def metadata(self) -> DocumentType | None:
        return self.content.get("metadata")

    @property
    def data(self) -> DocumentType | None:
        return self.content.get("data")

    @abstractmethod
    def search(
        self,
        search_path: Sequence[str | int],
        load: bool = False,
    ) -> Sequence[MachineSearchResults] | None:
        pass

    def search_recursive(self, target_key: str, load: bool = False) -> Sequence[MachineSearchResults] | None:
        if not self._load_type_flag.is_set(SnapshotLoadTypeFlag.DataWithMachine) and not load:
            return None
        self.load_from_flag(SnapshotLoadTypeFlag.DataWithMachine)
        # TODO: update logic; not use quam
        data = (self.data or {}).get("quam")
        if data is None:
            return None
        return get_subpath_value_on_any_depth(data, target_key)

    @abstractmethod
    def get_latest_snapshots(
        self, pages_filter: PageFilter, descending: bool = False
    ) -> tuple[int, Sequence["SnapshotBase"]]:
        pass

    @abstractmethod
    def compare_by_id(self, other_snapshot_int: int) -> Mapping[str, Mapping[str, Any]]:
        pass

    def dump(self) -> SnapshotModel:
        return SnapshotModel(**self.content)

    @abstractmethod
    def extract_state_update_type(
        self,
        path: str,
        **kwargs: Mapping[str, Any],
    ) -> Mapping[str, Any] | None:
        pass

    @abstractmethod
    def extract_state_update_types(
        self,
        paths: Sequence[str],
        **kwargs: Mapping[str, Any],
    ) -> Mapping[str, Mapping[str, Any] | None]:
        pass

    @abstractmethod
    def update_entry(self, updates: Mapping[str, Any]) -> bool:
        pass

    # --- Tag Management Methods ---

    @abstractmethod
    def get_tags(self) -> list[str]:
        """Get the tags assigned to this snapshot.

        Returns:
            List of tag names, or empty list if no tags.
        """
        pass

    @abstractmethod
    def set_tags(self, tags: list[str]) -> bool:
        """Set the tags for this snapshot (replaces existing tags).

        Args:
            tags: List of tag names to set.

        Returns:
            True if tags were set successfully, False otherwise.
        """
        pass

    @abstractmethod
    def add_tag(self, tag: str) -> bool:
        """Add a tag to this snapshot.

        Args:
            tag: The tag name to add.

        Returns:
            True if tag was added (or already exists), False on error.
        """
        pass

    @abstractmethod
    def remove_tag(self, tag: str) -> bool:
        """Remove a tag from this snapshot.

        Args:
            tag: The tag name to remove.

        Returns:
            True if tag was removed (or didn't exist), False on error.
        """
        pass

    # --- Comment Management Methods ---

    @abstractmethod
    def get_comments(self) -> list[dict[str, Any]]:
        """Get all comments for this snapshot.

        Returns:
            List of comment dictionaries with id, value, and created_at fields.
        """
        pass

    @abstractmethod
    def create_comment(self, value: str) -> dict[str, Any] | None:
        """Create a new comment on this snapshot.

        Args:
            value: The comment text.

        Returns:
            The created comment dict with id, value, created_at, or None on error.
        """
        pass

    @abstractmethod
    def update_comment(self, comment_id: int, value: str) -> bool:
        """Update an existing comment.

        Args:
            comment_id: The ID of the comment to update.
            value: The new comment text.

        Returns:
            True if comment was updated, False if not found or on error.
        """
        pass

    @abstractmethod
    def remove_comment(self, comment_id: int) -> bool:
        """Remove a comment from this snapshot.

        Args:
            comment_id: The ID of the comment to remove.

        Returns:
            True if comment was removed (or didn't exist), False on error.
        """
        pass

    def __repr__(self) -> str:
        return f"{self.__class__.__name__}(id={self.id!r}, load_type={self.load_type_flag!r})"
