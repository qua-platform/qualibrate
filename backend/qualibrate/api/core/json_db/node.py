from enum import IntEnum
from typing import Optional, cast

from qualibrate.api.core.json_db.storage import StorageJsonDb
from qualibrate.api.core.json_db.snapshot import (
    SnapshotJsonDb,
    SnapshotLoadType,
)
from qualibrate.api.core.utils.path_utils import resolve_and_check_relative
from qualibrate.config import get_settings

__all__ = ["NodeJsonDb", "NodeLoadType"]


class NodeLoadType(IntEnum):
    Empty = 0
    Snapshot = 1
    Full = 2


class NodeJsonDb:
    def __init__(
        self,
        snapshot_id: Optional[int] = None,
        snapshot: Optional[SnapshotJsonDb] = None,
    ):
        if sum(item is None for item in (snapshot_id, snapshot)) != 1:
            raise ValueError("Must provide either snapshot_id or snapshot")
        self._storage: Optional[StorageJsonDb] = None
        if snapshot_id is not None:
            self._snapshot = SnapshotJsonDb(snapshot_id)
            self._load_type = NodeLoadType.Empty
            return
        self._snapshot = cast(SnapshotJsonDb, snapshot)
        # TODO: think about this init part
        if self._snapshot.load_type < SnapshotLoadType.Metadata:
            self._load_type = NodeLoadType.Snapshot
        else:
            pass
        self._fill_storage()

    def _fill_storage(self) -> None:
        metadata = self._snapshot.metadata
        if metadata is None or not isinstance(metadata.get("output_path"), str):
            self._storage = None
            self._load_type = NodeLoadType.Snapshot
            return
        rel_output_path = metadata["output_path"]
        abs_output_path = resolve_and_check_relative(
            get_settings().user_storage, metadata["output_path"]
        )
        if not abs_output_path.is_dir():
            raise NotADirectoryError(f"{rel_output_path} is not a directory")
        self._storage = StorageJsonDb(abs_output_path)
        self._load_type = NodeLoadType.Full

    @property
    def load_type(self) -> NodeLoadType:
        return self._load_type

    def load(self, load_type: NodeLoadType) -> None:
        if self._load_type == NodeLoadType.Full:
            return
        self._snapshot.load(SnapshotLoadType.Metadata)
        if load_type < NodeLoadType.Full:
            return
        self._fill_storage()

    @property
    def snapshot(self) -> Optional[SnapshotJsonDb]:
        return self._snapshot

    @property
    def storage(self) -> Optional[StorageJsonDb]:
        return self._storage
