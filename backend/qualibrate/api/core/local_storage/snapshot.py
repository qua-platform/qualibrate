import functools
import json
from datetime import datetime
from pathlib import Path
from typing import Any, Callable, Mapping, Optional, Sequence, Tuple, Union

import jsonpatch

from qualibrate.api.core.bases.snapshot import SnapshotBase, SnapshotLoadType
from qualibrate.api.core.local_storage._id_to_local_path import IdToLocalPath
from qualibrate.api.core.local_storage.utils.filters import (
    date_less_or_eq,
    id_less_then_snapshot,
)
from qualibrate.api.core.local_storage.utils.node_utils import (
    find_n_latest_nodes_ids,
    id_from_node_name,
)
from qualibrate.api.core.types import DocumentSequenceType, DocumentType, IdType
from qualibrate.api.core.utils.find_utils import get_subpath_value
from qualibrate.api.core.utils.snapshots_compare import jsonpatch_to_mapping
from qualibrate.api.exceptions.classes.storage import QFileNotFoundException
from qualibrate.api.exceptions.classes.values import QValueException
from qualibrate.config import QualibrateSettings, get_settings

__all__ = ["SnapshotLocalStorage"]

SnapshotContentLoaderType = Callable[
    [Path, SnapshotLoadType, QualibrateSettings], DocumentType
]


def _get_node_id_and_name(node_path: Path) -> Tuple[Optional[IdType], str]:
    parts = node_path.stem.split("_", maxsplit=1)
    if len(parts) == 1:
        return None, parts[0]
    id_str, name = parts
    # TODO: merge with
    #  qualibrate.api.core.local_storage.utils.node_utils.id_from_node_name
    node_id = (
        int(id_str[1:])
        if id_str.startswith("#") and id_str[1:].isnumeric()
        else None
    )
    if node_id is None:
        return None, node_path.name
    return node_id, name


def _default_snapshot_content_loader(
    snapshot_path: Path,
    load_type: SnapshotLoadType,
    settings: QualibrateSettings,
) -> DocumentType:
    snapshot_file = snapshot_path / "state.json"
    if not snapshot_file.is_file():
        raise QFileNotFoundException(
            f"Snapshot {snapshot_path.stem} not exists"
        )
    node_id, node_name = _get_node_id_and_name(snapshot_path)
    parent_id = node_id - 1 if node_id else None
    if parent_id is not None:
        if IdToLocalPath(settings.user_storage).get(parent_id) is None:
            parent_id = None
    content: dict[str, Any] = {
        "parents": [parent_id] if parent_id else [],
        "created_at": datetime.fromtimestamp(snapshot_file.stat().st_mtime),
    }
    if load_type >= SnapshotLoadType.Metadata:
        metadata_out_path = snapshot_path.relative_to(settings.user_storage)
        content["metadata"] = {
            "name": node_name,
            settings.metadata_out_path: str(metadata_out_path),
        }
    if load_type >= SnapshotLoadType.Data:
        with snapshot_file.open("r") as f:
            data = json.load(f)
        content["data"] = data
    return content


class SnapshotLocalStorage(SnapshotBase):
    """
    Args:
        id: id of snapshot
        base_path: Path to content root

    Notes:
        Expected structure of content root
        - base_path
            - %Y-%m-%d
                - #{idx}_{name}_%H%M%S  # node
                    - data.json    # outputs
                    - state.json   # QuAM state
            - %Y-%m-%d
            ...
    """

    def __init__(
        self,
        id: IdType,
        content: Optional[DocumentType] = None,
        snapshot_loader: SnapshotContentLoaderType = _default_snapshot_content_loader,
    ):
        super().__init__(id=id, content=content)
        self._snapshot_loader = snapshot_loader

    def load(self, load_type: SnapshotLoadType) -> None:
        if load_type <= self._load_type:
            return None
        settings = get_settings()
        paths_mapping = IdToLocalPath(settings.user_storage)
        node_path = paths_mapping[self._id]
        content = self._snapshot_loader(node_path, load_type, settings)
        self.content.update(content)
        self._load_type = load_type

    @property
    def created_at(self) -> Optional[datetime]:
        return self.content.get("created_at")

    @property
    def parents(self) -> Optional[list[IdType]]:
        return self.content.get("parents")

    def search(
        self, search_path: Sequence[Union[str, int]], load: bool = False
    ) -> Optional[DocumentSequenceType]:
        if load:
            self.load(SnapshotLoadType.Data)
        if self.data is None:
            return None
        return get_subpath_value(self.data, search_path)

    def get_latest_snapshots(
        self, num_snapshots: int = 50
    ) -> Sequence[SnapshotBase]:
        settings = get_settings()
        # first in history is current
        if num_snapshots < 1:
            return []
        self.load(SnapshotLoadType.Metadata)
        if num_snapshots == 1:
            return [self]
        paths_mapping = IdToLocalPath(settings.user_storage)
        snapshot_path = paths_mapping[self._id]
        ids = find_n_latest_nodes_ids(
            settings.user_storage,
            num_snapshots - 1,
            date_filters=[
                functools.partial(
                    date_less_or_eq, date_to_compare=snapshot_path.parent.stem
                )
            ],
            node_filters=[
                functools.partial(
                    id_less_then_snapshot,
                    node_id_to_compare=id_from_node_name(snapshot_path.stem),
                )
            ],
        )
        snapshots = [SnapshotLocalStorage(id) for id in ids]
        for snapshot in snapshots:
            try:
                snapshot.load(SnapshotLoadType.Metadata)
            except OSError:
                pass
        return [self, *snapshots]

    def compare_by_id(
        self, other_snapshot_int: int
    ) -> Mapping[str, Mapping[str, Any]]:
        self.load(SnapshotLoadType.Data)
        other_snapshot = SnapshotLocalStorage(other_snapshot_int)
        other_snapshot.load(SnapshotLoadType.Data)
        this_data = self.data
        other_data = other_snapshot.data
        if this_data is None or other_data is None:
            raise QValueException("Can't load data of snapshots")
        return jsonpatch_to_mapping(
            this_data, jsonpatch.make_patch(dict(this_data), dict(other_data))
        )
