import json
from datetime import datetime
from pathlib import Path
from typing import Any, Callable, Mapping, Optional, Union

import jsonpatch

from qualibrate.api.core.bases.snapshot import SnapshotBase, SnapshotLoadType
from qualibrate.api.core.local_storage._id_to_local_path import IdToLocalPath
from qualibrate.api.core.types import DocumentSequenceType, DocumentType, IdType
from qualibrate.api.core.utils.find_utils import get_subpath_value
from qualibrate.api.core.utils.snapshots_compare import jsonpatch_to_mapping
from qualibrate.config import QualibrateSettings, get_settings


def _default_snapshot_content_loader(
    snapshot_path: Path,
    load_type: SnapshotLoadType,
    settings: QualibrateSettings,
) -> DocumentType:
    snapshot_file = snapshot_path / "state.json"
    if not snapshot_file.is_file():
        # TODO: custom exception
        raise FileNotFoundError(f"Snapshot {snapshot_path.stem} not exists")
    node_stem_parts = snapshot_path.stem.split("_")
    snapshot_id = (
        int(node_stem_parts[0][1:])
        if node_stem_parts[0][1:].isnumeric()
        else None
    )
    parent_id = snapshot_id - 1 if snapshot_id else None
    if parent_id is not None:
        if IdToLocalPath(settings.user_storage).get(parent_id) is None:
            parent_id = None
    content: dict[str, Any] = {
        "parents": [parent_id] if parent_id else [],
        "created_at": datetime.fromtimestamp(snapshot_file.stat().st_mtime),
    }
    if load_type >= SnapshotLoadType.Metadata:
        node_name = (
            node_stem_parts[1]
            if len(node_stem_parts) > 1
            else snapshot_path.stem
        )
        metadata_out_path = snapshot_path.relative_to(settings.user_storage)
        content["metadata"] = {
            "name": node_name,
            # TODO: move metadata out path from timeline config part to root
            settings.timeline_db.metadata_out_path: str(metadata_out_path),
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
        snapshot_loader: Callable[
            [Path, SnapshotLoadType, QualibrateSettings], DocumentType
        ] = _default_snapshot_content_loader,
    ):
        super().__init__(id=id, content=content)
        self._snapshot_loader = snapshot_loader

    def load(self, load_type: SnapshotLoadType) -> None:
        if load_type <= self._load_type:
            return None
        settings = get_settings()
        paths_mapping = IdToLocalPath(settings.user_storage)
        node_path = paths_mapping.get(self._id)
        if node_path is None:
            # TODO: Fail to load exception
            raise OSError("node with specified id not exists")
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
        self, search_path: list[Union[str, int]], load: bool = False
    ) -> Optional[DocumentSequenceType]:
        if self.data is None:
            return None
        return get_subpath_value(self.data, search_path)

    def get_latest_snapshots(
        self, num_snapshots: int = 50
    ) -> DocumentSequenceType:
        raise NotImplementedError

    def compare_by_id(
        self, other_snapshot_int: int
    ) -> Mapping[str, Mapping[str, Any]]:
        other_snapshot = SnapshotLocalStorage(other_snapshot_int)
        other_snapshot.load(SnapshotLoadType.Data)
        this_data = self.data
        other_data = other_snapshot.data
        if this_data is None or other_data is None:
            raise ValueError("can't load data of oin")
        return jsonpatch_to_mapping(
            this_data, jsonpatch.make_patch(dict(this_data), dict(other_data))
        )
