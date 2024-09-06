import json
import logging
from copy import deepcopy
from datetime import datetime
from pathlib import Path
from typing import (
    Any,
    Callable,
    Mapping,
    Optional,
    Sequence,
    Tuple,
    Union,
    cast,
)

import jsonpatch
import jsonpointer
import requests
from requests import JSONDecodeError as RequestsJSONDecodeError

from qualibrate_app.api.core.domain.bases.snapshot import (
    SnapshotBase,
    SnapshotLoadType,
)
from qualibrate_app.api.core.domain.local_storage._id_to_local_path import (
    IdToLocalPath,
)
from qualibrate_app.api.core.domain.local_storage.utils.node_utils import (
    find_latest_node_id,
    find_n_latest_nodes_ids,
)
from qualibrate_app.api.core.types import (
    DocumentSequenceType,
    DocumentType,
    IdType,
)
from qualibrate_app.api.core.utils.find_utils import get_subpath_value
from qualibrate_app.api.core.utils.path.node import NodePath
from qualibrate_app.api.core.utils.snapshots_compare import jsonpatch_to_mapping
from qualibrate_app.api.core.utils.types_parsing import TYPE_TO_STR
from qualibrate_app.api.exceptions.classes.storage import (
    QFileNotFoundException,
    QPathException,
)
from qualibrate_app.api.exceptions.classes.values import QValueException
from qualibrate_app.config import QualibrateAppSettings

__all__ = ["SnapshotLocalStorage"]

logger = logging.getLogger(__name__)

SnapshotContentLoaderType = Callable[
    [NodePath, SnapshotLoadType, QualibrateAppSettings], DocumentType
]
SnapshotContentUpdaterType = Callable[
    [
        NodePath,
        Mapping[str, Any],
        Sequence[Mapping[str, Any]],
        QualibrateAppSettings,
    ],
    bool,
]


def _read_minified_node_content(
    node_info: Mapping[str, Any],
    f_node_id: Optional[int],
    node_filepath: Path,
    settings: QualibrateAppSettings,
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
    project = settings.qualibrate.project
    user_storage = settings.qualibrate.storage.location
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
            created_at = datetime.fromtimestamp(
                node_filepath.stat().st_mtime
            ).astimezone()
        else:
            created_at = datetime.fromtimestamp(
                node_filepath.parent.stat().st_mtime
            ).astimezone()
    return {
        "id": node_id,
        "parents": parents,
        "created_at": created_at,
    }


def _read_metadata_node_content(
    node_info: Mapping[str, Any],
    f_node_name: str,
    snapshot_path: Path,
    settings: QualibrateAppSettings,
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
        str(snapshot_path.relative_to(settings.qualibrate.storage.location)),
    )
    return node_metadata


def _get_node_filepath(snapshot_path: NodePath) -> Path:
    return snapshot_path / "node.json"


def _get_data_node_filepath(
    node_info: Mapping[str, Any], node_filepath: Path, snapshot_path: Path
) -> Optional[Path]:
    node_data = dict(node_info.get("data", {}))
    quam_relative_path = node_data.get("quam", "state.json")
    quam_file_path = node_filepath.parent.joinpath(quam_relative_path).resolve()
    if not quam_file_path.is_relative_to(snapshot_path):
        raise QFileNotFoundException("Unknown quam data path")
    if quam_file_path.is_file():
        return quam_file_path
    return None


def _read_data_node_content(
    node_info: Mapping[str, Any], node_filepath: Path, snapshot_path: Path
) -> Optional[dict[str, Any]]:
    """Read quam data based on node info.

    Args:
        node_info: Node content
        node_filepath: path to file that contains node info
        snapshot_path: Node root
    """
    quam_file_path = _get_data_node_filepath(
        node_info, node_filepath, snapshot_path
    )
    if quam_file_path is None:
        return None
    with quam_file_path.open("r") as f:
        return dict(json.load(f))


def _default_snapshot_content_updater(
    snapshot_path: NodePath,
    new_snapshot: Mapping[str, Any],
    patches: Sequence[Mapping[str, Any]],
    settings: QualibrateAppSettings,
) -> bool:
    node_filepath = _get_node_filepath(snapshot_path)
    if not node_filepath.is_file():
        return False
    node_info = _default_snapshot_content_loader(
        snapshot_path, SnapshotLoadType.Empty, settings, raw=True
    )
    quam_file_path = _get_data_node_filepath(
        node_info, node_filepath, snapshot_path
    )
    if quam_file_path is None:
        return False
    with quam_file_path.open("w") as f:
        json.dump(new_snapshot, f, indent=4)
    node_info = dict(node_info)
    if "patches" in node_info:
        if not isinstance(node_info["patches"], list):
            raise QValueException("Patches is not sequence")
        node_info["patches"].extend(patches)
    else:
        node_info["patches"] = patches
    with node_filepath.open("w") as f:
        json.dump(node_info, f, indent=4)

    if not settings.qualibrate.active_machine.path:
        logger.info("No active machine path to update")
        pass
    elif settings.qualibrate.active_machine.path.is_dir():
        logger.info(
            f"Updating quam state dir {settings.qualibrate.active_machine.path}"
        )
        contents = deepcopy(dict(new_snapshot))
        content_mapping = {"wiring.json": {"wiring", "network"}}

        for filename, content_keys in content_mapping.items():
            wiring_snapshot = {
                key: contents.pop(key)
                for key in content_keys
                if key in contents
            }
            logger.info(
                f"Writing {filename} to {settings.qualibrate.active_machine.path}"
            )
            (settings.qualibrate.active_machine.path / filename).write_text(
                json.dumps(wiring_snapshot, indent=4)
            )

        logger.info(
            f"Writing state.json to {settings.qualibrate.active_machine.path}"
        )
        (settings.qualibrate.active_machine.path / "state.json").write_text(
            json.dumps(contents, indent=4)
        )
    else:
        logger.info(
            f"Updating quam state file {settings.qualibrate.active_machine.path}"
        )
        settings.qualibrate.active_machine.path.write_text(
            json.dumps(new_snapshot, indent=4)
        )

    return True


def _default_snapshot_content_loader(
    snapshot_path: NodePath,
    load_type: SnapshotLoadType,
    settings: QualibrateAppSettings,
    raw: bool = False,
) -> DocumentType:
    node_filepath = _get_node_filepath(snapshot_path)
    if node_filepath.is_file():
        with node_filepath.open("r") as f:
            try:
                node_info = json.load(f)
            except json.JSONDecodeError:
                node_info = {}
    else:
        node_info = {}
    if raw:
        return cast(DocumentType, node_info)
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
        snapshot_updater: SnapshotContentUpdaterType = _default_snapshot_content_updater,
        *,
        settings: QualibrateAppSettings,
    ):
        super().__init__(id=id, content=content, settings=settings)
        self._snapshot_loader = snapshot_loader
        self._snapshot_updater = snapshot_updater
        self._node_path: Optional[NodePath] = None

    @property
    def node_path(self) -> NodePath:
        if self._node_path is None:
            self._node_path = IdToLocalPath().get_or_raise(
                self._settings.qualibrate.project,
                self._id,
                self._settings.qualibrate.storage.location,
            )
        return self._node_path

    def load(self, load_type: SnapshotLoadType) -> None:
        if load_type <= self._load_type:
            return None
        content = self._snapshot_loader(
            self.node_path, load_type, self._settings
        )
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
        total = find_latest_node_id(self._settings.qualibrate.storage.location)
        self.load(SnapshotLoadType.Metadata)
        if page == 1 and per_page == 1:
            return total, [self]
        ids = find_n_latest_nodes_ids(
            self._settings.qualibrate.storage.location,
            page,
            per_page,
            self._settings.qualibrate.project,
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

    @staticmethod
    def _conversion_type_from_value(value: Any) -> Mapping[str, Any]:
        if isinstance(value, list):
            if len(value) == 0:
                return {"type": "array"}
            item_type = TYPE_TO_STR.get(type(value[0]))
            if item_type is None:
                return {"type": "array"}
            return {"type": "array", "items": {"type": item_type}}
        item_type = TYPE_TO_STR.get(type(value))
        if item_type is None:
            return {"type": "null"}
        return {"type": item_type}

    def _extract_state_updates_type_from_runner(
        self, path: str
    ) -> Optional[Mapping[str, Any]]:
        try:
            last_run_response = requests.get(
                f"{self._settings.runner.address}/last_run"
            )
        except requests.exceptions.ConnectionError:
            return None
        if last_run_response.status_code != 200:
            return None
        try:
            data = last_run_response.json()
        except RequestsJSONDecodeError:
            return None
        state_update = data.get("state_updates", {}).get(path)
        if state_update is None:
            return None
        new_state = state_update.get("new", object)
        if new_state is object:
            return None
        return self._conversion_type_from_value(new_state)

    def _extract_state_updates_from_quam_state(
        self, path: str
    ) -> Optional[Mapping[str, Any]]:
        try:
            quam_state_file: Path = self.node_path / "quam_state.json"
        except QFileNotFoundException:
            return None
        if not quam_state_file.is_file():
            return None
        try:
            quam_state = json.loads(quam_state_file.read_text())
        except json.JSONDecodeError:
            return None
        quam_item = jsonpointer.resolve_pointer(quam_state, path[1:], object)
        if quam_item is object:
            return None
        return self._conversion_type_from_value(quam_item)

    def extract_state_update_type(
        self, path: str
    ) -> Optional[Mapping[str, Any]]:
        _type = self._extract_state_updates_type_from_runner(path)
        if _type is not None:
            return _type
        return self._extract_state_updates_from_quam_state(path)

    def update_entry(self, updates: Mapping[str, Any]) -> bool:
        if self.load_type < SnapshotLoadType.Data:
            self.load(SnapshotLoadType.Data)
        data = self.data
        if data is None:
            return False

        path_values = {
            path: jsonpointer.resolve_pointer(data, path[1:], None)
            for path in updates.keys()
        }
        replace_updates = filter(
            lambda k: path_values[k] is not None, updates.keys()
        )
        add_updates = filter(lambda k: path_values[k] is None, updates.keys())
        replace_patch_operations = [
            {
                "op": "replace",
                "path": path[1:],
                "value": updates[path],
                "old": path_values[path],
            }
            for path in replace_updates
        ]
        add_patch_operations = [
            {"op": "add", "path": path[1:], "value": updates[path]}
            for path in add_updates
        ]
        patch_operations = add_patch_operations + replace_patch_operations
        patch = jsonpatch.JsonPatch(patch_operations)
        try:
            new_data = patch.apply(dict(data))
            res = self._snapshot_updater(
                self.node_path, new_data, patch_operations, self._settings
            )
            return res
        except jsonpatch.JsonPatchException:
            raise QPathException("Unknown path to update")
        except OSError:
            return False
