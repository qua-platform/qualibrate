import json
from datetime import datetime
from pathlib import Path
from typing import Any, Callable, Mapping, Optional, Sequence, Tuple, Union

import jsonpatch

from qualibrate.api.core.domain.bases.snapshot import (
    SnapshotBase,
    SnapshotLoadType,
)
from qualibrate.api.core.domain.local_storage._id_to_local_path import (
    IdToLocalPath,
)
from qualibrate.api.core.domain.local_storage.utils.node_utils import (
    find_latest_node_id,
    find_n_latest_nodes_ids,
)
from qualibrate.api.core.types import DocumentSequenceType, DocumentType, IdType
from qualibrate.api.core.utils.find_utils import get_subpath_value
from qualibrate.api.core.utils.path.node import NodePath
from qualibrate.api.core.utils.snapshots_compare import jsonpatch_to_mapping
from qualibrate.api.exceptions.classes.storage import QFileNotFoundException
from qualibrate.api.exceptions.classes.values import QValueException
from qualibrate.config import QualibrateSettings

__all__ = ["SnapshotLocalStorage"]

SnapshotContentLoaderType = Callable[
    [NodePath, SnapshotLoadType, QualibrateSettings], DocumentType
]


def _read_minified_node_content(
    node_info: Mapping[str, Any],
    f_node_id: Optional[int],
    node_filepath: Path,
    settings: QualibrateSettings,
) -> dict[str, Any]:
    """
    Args:
        node_info: content of node file
        f_node_id: node id got from node path
        node_filepath: path to file with node info
        settings: qualbirate settings

    Returns:
        Minified content on node
    """
    node_id = node_info.get("id", f_node_id or -1)
    parents = node_info.get(
        "parents", [node_id - 1] if node_id and node_id > 0 else []
    )
    id_local_path = IdToLocalPath()
    project = settings.project
    user_storage = settings.user_storage
    parents = list(
        filter(
            lambda p_id: id_local_path.get(project, p_id, user_storage), parents
        )
    )
    created_at_str = node_info.get("created_at")
    if created_at_str is not None:
        created_at = datetime.fromisoformat(created_at_str)
    else:
        if node_filepath.is_file():
            created_at = datetime.fromtimestamp(node_filepath.stat().st_mtime)
        else:
            created_at = datetime.fromtimestamp(
                node_filepath.parent.stat().st_mtime
            )
    return {
        "id": node_id,
        "parents": parents,
        "created_at": created_at,
    }


def _read_metadata_node_content(
    node_info: Mapping[str, Any],
    f_node_name: str,
    snapshot_path: Path,
    settings: QualibrateSettings,
) -> dict[str, Any]:
    """
    Args:
        node_info: content of node file
        f_node_name: node name got from node path
        snapshot_path: path to common node directory
        settings: qualbirate settings

    Returns:
        Minified content on node
    """
    node_metadata = dict(node_info.get("metadata", {}))
    node_metadata.setdefault("name", f_node_name)
    node_metadata.setdefault(
        settings.metadata_out_path,
        str(snapshot_path.relative_to(settings.user_storage)),
    )
    return node_metadata


def _read_data_node_content(
    node_info: Mapping[str, Any], node_filepath: Path, snapshot_path: Path
) -> Optional[dict[str, Any]]:
    """Read quam data based on node info.

    Args:
        node_info: Node content
        node_filepath: path to file that contains node info
        snapshot_path: Node root
    """
    node_data = dict(node_info.get("data", {}))
    quam_relative_path = node_data.get("quam", "state.json")
    quam_file_path = node_filepath.parent.joinpath(quam_relative_path).resolve()
    if not quam_file_path.is_relative_to(snapshot_path):
        raise QFileNotFoundException("Unknown quam data path")
    if quam_file_path.is_file():
        with quam_file_path.open("r") as f:
            return dict(json.load(f))
    else:
        return None


def _default_snapshot_content_loader(
    snapshot_path: NodePath,
    load_type: SnapshotLoadType,
    settings: QualibrateSettings,
) -> DocumentType:
    node_filepath = snapshot_path / "node.json"
    if node_filepath.is_file():
        with node_filepath.open("r") as f:
            try:
                node_info = json.load(f)
            except json.JSONDecodeError:
                node_info = {}
    else:
        node_info = {}
    content = _read_minified_node_content(
        node_info, snapshot_path.id, node_filepath, settings
    )
    if load_type < SnapshotLoadType.Metadata:
        return content
    content["metadata"] = _read_metadata_node_content(
        node_info, snapshot_path.node_name, snapshot_path, settings
    )
    if load_type < SnapshotLoadType.Data:
        return content
    content["data"] = _read_data_node_content(
        node_info, node_filepath, snapshot_path
    )
    return content


class SnapshotLocalStorage(SnapshotBase):
    """
    Args:
        id: id of snapshot

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
        *,
        settings: QualibrateSettings,
    ):
        super().__init__(id=id, content=content, settings=settings)
        self._snapshot_loader = snapshot_loader

    def load(self, load_type: SnapshotLoadType) -> None:
        if load_type <= self._load_type:
            return None
        node_path = IdToLocalPath().get_or_raise(
            self._settings.project,
            self._id,
            self._settings.user_storage,
        )
        content = self._snapshot_loader(node_path, load_type, self._settings)
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
        self, page: int = 1, per_page: int = 50, reverse: bool = False
    ) -> Tuple[int, Sequence[SnapshotBase]]:
        # first in history is current
        total = find_latest_node_id(self._settings.user_storage)
        self.load(SnapshotLoadType.Metadata)
        if page == 1 and per_page == 1:
            return total, [self]
        ids = find_n_latest_nodes_ids(
            self._settings.user_storage,
            page,
            per_page,
            self._settings.project,
            max_node_id=(self.id or total) - 1,
        )
        snapshots = [
            SnapshotLocalStorage(id, settings=self._settings) for id in ids
        ]
        for snapshot in snapshots:
            try:
                snapshot.load(SnapshotLoadType.Metadata)
            except OSError:
                pass
        return total, [self, *snapshots]

    def compare_by_id(
        self, other_snapshot_id: int
    ) -> Mapping[str, Mapping[str, Any]]:
        if self.id == other_snapshot_id:
            raise QValueException("Can't compare snapshots with same id")
        self.load(SnapshotLoadType.Data)
        this_data = self.data
        if this_data is None:
            raise QValueException(f"Can't load data of snapshot {self._id}")
        other_snapshot = SnapshotLocalStorage(
            other_snapshot_id, settings=self._settings
        )
        other_snapshot.load(SnapshotLoadType.Data)
        other_data = other_snapshot.data
        if other_data is None:
            raise QValueException(
                f"Can't load data of snapshot {other_snapshot_id}"
            )
        return jsonpatch_to_mapping(
            this_data, jsonpatch.make_patch(dict(this_data), dict(other_data))
        )
