import contextlib
import json
import logging
from collections.abc import Mapping, MutableMapping, Sequence
from datetime import datetime
from pathlib import Path
from typing import (
    Any,
    Callable,
    Optional,
    Union,
    cast,
)
from urllib.parse import urljoin

import jsonpatch
import jsonpointer
import requests
from qualibrate_config.models import QualibrateConfig
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
from qualibrate_app.api.core.schemas.state_updates import StateUpdates
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
from qualibrate_app.config.resolvers import get_quam_state_path
from qualibrate_app.config.vars import METADATA_OUT_PATH

__all__ = ["SnapshotLocalStorage"]

logger = logging.getLogger(__name__)

SnapshotContentLoaderType = Callable[
    [NodePath, SnapshotLoadType, QualibrateConfig], DocumentType
]
SnapshotContentUpdaterType = Callable[
    [
        NodePath,
        Mapping[str, Any],
        Sequence[Mapping[str, Any]],
        QualibrateConfig,
    ],
    bool,
]


def _read_minified_node_content(
    node_info: Mapping[str, Any],
    f_node_id: Optional[int],
    node_filepath: Path,
    settings: QualibrateConfig,
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
    user_storage = settings.storage.location
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
    run_start_str = node_info.get("run_start")
    run_end_str = node_info.get("run_end")
    return {
        "id": node_id,
        "parents": parents,
        "created_at": created_at,
        "run_start": (
            datetime.fromisoformat(run_start_str) if run_start_str else None
        ),
        "run_end": (
            datetime.fromisoformat(run_end_str) if run_end_str else None
        ),
    }


def _read_metadata_node_content(
    node_info: Mapping[str, Any],
    f_node_name: str,
    snapshot_path: Path,
    settings: QualibrateConfig,
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
        METADATA_OUT_PATH,
        str(snapshot_path.relative_to(settings.storage.location)),
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


def _get_data_node_dir(snapshot_path: Path) -> Optional[Path]:
    quam_state_dir = snapshot_path / "quam_state"
    return quam_state_dir if quam_state_dir.is_dir() else None


def _update_state_dir(
    state_dir: Path,
    new_quam: Mapping[str, Any],
) -> None:
    """
    Update the QUAM state directory with a new QUAM state.

    The state directory contains multiple json files, each
    containing some top-level keys of the QUAM state.
    For example, it can contain one file called "wiring.json"
    which contains the entries "wiring" and "network", and a
    file called "state.json" containing everything else.

    Note that new top-level entries will not be added, raising
    a warning

    Args:
        state_dir: QUAM state directory containing JSON files.
        new_quam: QUAM state that should be saved to the JSON
            files in the state directory.
    """
    copied = dict(new_quam).copy()
    for state_file in state_dir.glob("*.json"):
        with state_file.open("r") as f:
            state_content = json.load(f)

        new_state_content = {}
        for component in state_content:
            new_state_content[component] = copied.pop(component)

        with state_file.open("w") as f:
            json.dump(new_state_content, f, indent=4)
    if len(copied) > 0:
        logger.warning(
            "Not all root items of the new quam state have been saved to the "
            f"QUAM state directory {state_dir}."
        )


def _update_active_machine_path(
    settings: QualibrateConfig, new_quam: Mapping[str, Any]
) -> None:
    am_path = get_quam_state_path(settings)
    if not am_path:
        logger.info("No active machine path to update")
        return
    if am_path.is_dir():
        logger.info(f"Updating quam state dir {am_path}")
        _update_state_dir(am_path, new_quam)
        return
    logger.info(f"Updating quam state file {am_path}")
    am_path.write_text(json.dumps(new_quam, indent=4))


def _read_data_node_content(
    node_info: Mapping[str, Any], node_filepath: Path, snapshot_path: Path
) -> dict[str, Any]:
    """Read quam data based on node info.

    Args:
        node_info: Node content
        node_filepath: path to file that contains node info
        snapshot_path: Node root
    """
    quam_file_path = _get_data_node_filepath(
        node_info, node_filepath, snapshot_path
    )
    node_data = dict(node_info.get("data", {}))
    other_data = {
        "parameters": dict(node_data.get("parameters", {})).get("model"),
        "outcomes": node_data.get("outcomes"),
    }
    if quam_file_path is None:
        return {"quam": None, **other_data}
    with quam_file_path.open("r") as f:
        return {"quam": dict(json.load(f)), **other_data}


def _default_snapshot_content_updater(
    snapshot_path: NodePath,
    new_snapshot: Mapping[str, Any],
    patches: Sequence[Mapping[str, Any]],
    settings: QualibrateConfig,
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
    new_quam = new_snapshot["quam"]
    with quam_file_path.open("w") as f:
        json.dump(new_quam, f, indent=4)
    node_info = dict(node_info)
    if "patches" in node_info:
        if not isinstance(node_info["patches"], list):
            raise QValueException("Patches is not sequence")
        node_info["patches"].extend(patches)
    else:
        node_info["patches"] = patches
    with node_filepath.open("w") as f:
        json.dump(node_info, f, indent=4)
    quam_dir = _get_data_node_dir(snapshot_path)
    if quam_dir is not None:
        _update_state_dir(quam_dir, new_quam)
    _update_active_machine_path(settings, new_quam)
    return True


def _default_snapshot_content_loader(
    snapshot_path: NodePath,
    load_type: SnapshotLoadType,
    settings: QualibrateConfig,
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
    A class for managing local storage of snapshots, inheriting from
    `SnapshotBase`.

    Args:
        id: The identifier of the snapshot.
        content: The content of the snapshot. Defaults to None.
        snapshot_loader: Function to load snapshot content.
            Defaults to `_default_snapshot_content_loader`.
        snapshot_updater: Function to update snapshot content.
            Defaults to `_default_snapshot_content_updater`.
        settings: The application settings for Qualibrate.

    Notes:
        Expected structure of content root:
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
        snapshot_loader: SnapshotContentLoaderType = (
            _default_snapshot_content_loader
        ),
        snapshot_updater: SnapshotContentUpdaterType = (
            _default_snapshot_content_updater
        ),
        *,
        settings: QualibrateConfig,
    ):
        """Initializes the SnapshotLocalStorage instance."""
        super().__init__(id=id, content=content, settings=settings)
        self._snapshot_loader = snapshot_loader
        self._snapshot_updater = snapshot_updater
        self._node_path: Optional[NodePath] = None

    @property
    def node_path(self) -> NodePath:
        """
        Returns the path to the node.

        Returns:
            The path to the node.
        """
        if self._node_path is None:
            self._node_path = IdToLocalPath().get_or_raise(
                self._settings.project,
                self._id,
                self._settings.storage.location,
            )
        return self._node_path

    def load(self, load_type: SnapshotLoadType) -> None:
        """
        Loads snapshot content based on the specified load type.

        Args:
            load_type: The type of content to load.
        """
        if load_type <= self._load_type:
            return None
        content = self._snapshot_loader(
            self.node_path, load_type, self._settings
        )
        self.content.update(content)
        self._load_type = load_type

    @property
    def created_at(self) -> Optional[datetime]:
        """
        Returns the creation date of the snapshot.

        Returns:
            The creation date or None if not available.
        """
        return self.content.get("created_at")

    @property
    def parents(self) -> Optional[list[IdType]]:
        """
        Returns the list of parent snapshot IDs.

        Returns:
            The parent IDs or None if not available.
        """
        return self.content.get("parents")

    def search(
        self, search_path: Sequence[Union[str, int]], load: bool = False
    ) -> Optional[DocumentSequenceType]:
        """
        Searches for a value in the snapshot data at a specified path.

        Args:
            search_path: The path to search.
            load: Whether to load the data before searching. Defaults to False.

        Returns:
            The found value or None if not found.
        """
        if load:
            self.load(SnapshotLoadType.Data)
        if self.data is None or "quam" not in self.data:
            return None
        # TODO: update logic; not use quam directly
        return get_subpath_value(self.data["quam"], search_path)

    def get_latest_snapshots(
        self, page: int = 1, per_page: int = 50, reverse: bool = False
    ) -> tuple[int, Sequence[SnapshotBase]]:
        """
        Retrieves the latest snapshots. First item in sequence is current.

        Args:
            page: The page number. Defaults to 1.
            per_page: The number of snapshots per page. Defaults to 50.
            reverse: Whether to reverse the order. Defaults to False.

        Returns:
            Total number of snapshots and a sequence of the latest snapshots.
        """
        storage_location = self._settings.storage.location
        total = find_latest_node_id(storage_location)
        self.load(SnapshotLoadType.Metadata)
        if page == 1 and per_page == 1:
            return total, [self]
        ids = find_n_latest_nodes_ids(
            storage_location,
            page,
            per_page,
            self._settings.project,
            max_node_id=(self.id or total) - 1,
        )
        snapshots = [
            SnapshotLocalStorage(id, settings=self._settings) for id in ids
        ]
        for snapshot in snapshots:
            with contextlib.suppress(OSError):
                snapshot.load(SnapshotLoadType.Metadata)
        return total, [self, *snapshots]

    def compare_by_id(
        self, other_snapshot_id: int
    ) -> Mapping[str, Mapping[str, Any]]:
        """
        Compares the current snapshot with another snapshot by ID.

        Args:
            other_snapshot_id: The ID of the other snapshot.

        Returns:
            The comparison result as a mapping.

        Raises:
            QValueException: If comparing with the same snapshot ID or if data
                cannot be loaded.
        """
        if self.id == other_snapshot_id:
            raise QValueException("Can't compare snapshots with same id")
        self.load(SnapshotLoadType.Data)
        # TODO: update logic; not use quam directly
        this_data = (self.data or {}).get("quam")
        if this_data is None:
            raise QValueException(f"Can't load data of snapshot {self._id}")
        other_snapshot = SnapshotLocalStorage(
            other_snapshot_id, settings=self._settings
        )
        other_snapshot.load(SnapshotLoadType.Data)
        # TODO: update logic; not use quam directly
        other_data = (other_snapshot.data or {}).get("quam")
        if other_data is None:
            raise QValueException(
                f"Can't load data of snapshot {other_snapshot_id}"
            )
        return jsonpatch_to_mapping(
            this_data, jsonpatch.make_patch(dict(this_data), dict(other_data))
        )

    @staticmethod
    def _conversion_type_from_value(value: Any) -> Mapping[str, Any]:
        """
        Determines the type of given value for JSON schema conversion.

        Args:
            value: The value to analyze.

        Returns:
            A mapping indicating the type.
        """
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

    def get_state_updates_from_runner(
        self,
        **kwargs: Any,
    ) -> Optional[StateUpdates]:
        """
        Retrieves state updates from the runner.

        Args:
            **kwargs: Additional arguments such as cookies for the request.

        Returns:
            The state updates or None if retrieval fails.
        """
        if self._settings.runner is None:
            logger.warning("Runner config is not set")
            return None
        try:
            cookies = cast(
                Optional[MutableMapping[str, str]], kwargs.get("cookies")
            )
            last_run_response = requests.get(
                urljoin(self._settings.runner.address_with_root, "last_run/"),
                cookies=cookies,
            )
        except requests.exceptions.ConnectionError:
            return None
        if last_run_response.status_code != 200:
            return None
        try:
            data = last_run_response.json()
        except RequestsJSONDecodeError:
            return None
        if data is None:
            return None
        return StateUpdates(state_updates=data.get("state_updates", {}))

    def _extract_state_update_type_from_runner(
        self,
        path: str,
        state_updates: Optional[StateUpdates] = None,
        **kwargs: Any,
    ) -> Optional[Mapping[str, Any]]:
        """
        Extracts the state update type for a specific path from the runner.

        Args:
            path: The path to extract the state update type from.
            state_updates: Pre-fetched state updates. Defaults to None.
            **kwargs: Additional arguments for retrieving state updates.

        Returns:
            The type mapping for the state update, or None if not found.
        """
        if state_updates is None:
            state_updates = self.get_state_updates_from_runner(**kwargs)
        if state_updates is None or path not in state_updates.state_updates:
            return None
        new_state = state_updates.state_updates[path].new
        return self._conversion_type_from_value(new_state)

    def extract_state_update_types_from_runner(
        self,
        paths: Sequence[str],
        state_updates: Optional[StateUpdates] = None,
        **kwargs: Any,
    ) -> Mapping[str, Optional[Mapping[str, Any]]]:
        """
        Extracts state update types for multiple paths from the runner.

        Args:
            paths: A sequence of paths to extract state update types for.
            state_updates: Pre-fetched state updates. Defaults to None.
            **kwargs: Additional arguments for retrieving state updates.

        Returns:
            A mapping of paths to their respective state update types.
        """
        if state_updates is None:
            state_updates = self.get_state_updates_from_runner(**kwargs)
        if state_updates is None:
            return {}
        return {
            path: self._extract_state_update_type_from_runner(
                path, state_updates
            )
            for path in paths
        }

    def get_quam_state(
        self,
    ) -> Optional[Mapping[str, Any]]:
        """
        Retrieves the QuAM state from the snapshot.

        Returns:
            The QuAM state data or None if not available.
        """
        try:
            quam_state_file: Path = self.node_path / "quam_state.json"
        except QFileNotFoundException:
            return None
        # TODO: fix quam state resolved (should check data property)
        if not quam_state_file.is_file():
            quam_state_file = self.node_path / "state.json"
        if not quam_state_file.is_file():
            return None
        try:
            return cast(
                Mapping[str, Any], json.loads(quam_state_file.read_text())
            )
        except json.JSONDecodeError:
            return None

    def _extract_state_update_type_from_quam_state(
        self, path: str, quam_state: Optional[Mapping[str, Any]] = None
    ) -> Optional[Mapping[str, Any]]:
        """
        Extracts the state update type for a specific path from the QuAM state.

        Args:
            path: The path to extract the state update type from.
            quam_state: Pre-fetched QuAM state. Defaults to None.

        Returns:
            The type mapping for the state update, or None if not found.
        """
        if quam_state is None:
            quam_state = self.get_quam_state()
        if quam_state is None:
            return None
        quam_item = jsonpointer.resolve_pointer(quam_state, path[1:], object)
        if quam_item is object:
            return None
        return self._conversion_type_from_value(quam_item)

    def extract_state_update_types_from_quam_state(
        self,
        paths: Sequence[str],
        quam_state: Optional[Mapping[str, Any]] = None,
    ) -> Optional[Mapping[str, Any]]:
        """
        Extracts state update types for multiple paths from the QuAM state.

        Args:
            paths: A sequence of paths to extract state update types for.
            quam_state: Pre-fetched QuAM state. Defaults to None.

        Returns:
            A mapping of paths to their respective state update types.
        """
        if quam_state is None:
            quam_state = self.get_quam_state()
        if quam_state is None:
            return None
        return {
            path: self._extract_state_update_type_from_quam_state(
                path, quam_state
            )
            for path in paths
        }

    def _saved_data_quam_path(self, path: str) -> str:
        parts = path.split("/", maxsplit=1)
        if len(parts) == 1:
            return path
        return "/".join([parts[0], "quam", parts[1]])

    def extract_state_update_type(
        self,
        path: str,
        **kwargs: Mapping[str, Any],
    ) -> Optional[Mapping[str, Any]]:
        """
        Extracts the state update type for a specific path from either the
        runner or QuAM state.

        Args:
            path: The path to extract the state update type from.
            **kwargs: Additional arguments for retrieving state updates.

        Returns:
            The type mapping for the state update, or None if not found.
        """
        _type = self._extract_state_update_type_from_runner(
            path, None, **kwargs
        )
        if _type is not None:
            return _type
        return self._extract_state_update_type_from_quam_state(path)

    def extract_state_update_types(
        self,
        paths: Sequence[str],
        **kwargs: Mapping[str, Any],
    ) -> Mapping[str, Optional[Mapping[str, Any]]]:
        """
        Extracts state update types for multiple paths from either the runner
        or QuAM state.

        Args:
            paths: A sequence of paths to extract state update types for.
            **kwargs: Additional arguments for retrieving state updates.

        Returns:
            A mapping of paths to their respective state update types.
        """
        types = self.extract_state_update_types_from_runner(
            paths, None, **kwargs
        )
        if len(types):
            return types
        return self.extract_state_update_types_from_quam_state(paths) or {}

    def update_entry(self, updates: Mapping[str, Any]) -> bool:
        """
        Updates the snapshot data with specified updates.

        Args:
            updates: A mapping of paths to new values for the update.

        Returns:
            True if the update was successful, False otherwise.

        Raises:
            QPathException: If an unknown path is encountered during the update.
        """
        if self.load_type < SnapshotLoadType.Data:
            self.load(SnapshotLoadType.Data)
        data = self.data
        if data is None or not isinstance(data.get("quam"), Mapping):
            return False
        # override update paths with quam prefix
        updates = {self._saved_data_quam_path(k): v for k, v in updates.items()}

        path_values = {
            path: jsonpointer.resolve_pointer(data, path[1:], None)
            for path in updates
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
        except jsonpatch.JsonPatchException as ex:
            raise QPathException("Unknown path to update") from ex
        except OSError:
            return False
