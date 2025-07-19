import json
import logging
from collections.abc import Mapping, Sequence
from datetime import datetime
from pathlib import Path
from typing import (
    Any,
    Callable,
    Optional,
    cast,
)

from qualibrate_config.models import QualibrateConfig

from qualibrate_app.api.core.domain.bases.snapshot import (
    SnapshotLoadType,
    SnapshotLoadTypeFlag,
)
from qualibrate_app.api.core.domain.bases.storage import (
    DataFileStorage,
    StorageLoadTypeFlag,
)
from qualibrate_app.api.core.domain.local_storage._id_to_local_path import (
    IdToLocalPath,
)
from qualibrate_app.api.core.types import (
    DocumentType,
)
from qualibrate_app.api.core.utils.path.node import NodePath
from qualibrate_app.api.exceptions.classes.storage import QFileNotFoundException
from qualibrate_app.api.exceptions.classes.values import QValueException
from qualibrate_app.config.resolvers import get_quam_state_path
from qualibrate_app.config.vars import METADATA_OUT_PATH

logger = logging.getLogger(__name__)

__all__ = [
    "SnapshotContentLoaderType",
    "SnapshotContentUpdaterType",
    "default_snapshot_content_loader",
    "default_snapshot_content_updater",
]

SnapshotContentLoaderType = Callable[
    [
        NodePath,
        SnapshotLoadTypeFlag,
        QualibrateConfig,
        bool,
        Optional[dict[str, Any]],
    ],
    DocumentType,
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


def read_minified_node_content(
    node_info: Mapping[str, Any],
    node_filepath: Path,
    snapshot_path: NodePath,
    settings: QualibrateConfig,
) -> dict[str, Any]:
    """
    Args:
        node_info: content of node file
        node_filepath: path to file that contains node info
        snapshot_path: Node root
        settings: qualbirate settings

    Returns:
        Minified content on node
    """
    node_id = node_info.get("id", snapshot_path.id or -1)
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


def read_metadata_node_content(
    node_info: Mapping[str, Any],
    node_path: Path,
    snapshot_path: NodePath,
    settings: QualibrateConfig,
) -> dict[str, Any]:
    """
    Args:
        node_info: content of node file
        node_path: path to file that contains node info
        snapshot_path: path to common node directory
        settings: qualbirate settings

    Returns:
        Minified content on node
    """
    node_metadata = dict(node_info.get("metadata", {}))
    node_metadata.setdefault("name", snapshot_path.node_name)
    node_metadata.setdefault(
        METADATA_OUT_PATH,
        str(snapshot_path.relative_to(settings.storage.location)),
    )
    return node_metadata


def get_node_filepath(snapshot_path: NodePath) -> Path:
    return snapshot_path / "node.json"


def get_data_node_path(
    node_info: Mapping[str, Any], node_filepath: Path, snapshot_path: Path
) -> Optional[Path]:
    node_data = dict(node_info.get("data", {}))
    quam_relative_path = node_data.get("quam") or node_data.get("machine")
    if quam_relative_path is None:
        return None
    quam_abs_path = node_filepath.parent.joinpath(quam_relative_path).resolve()
    if not quam_abs_path.is_relative_to(snapshot_path):
        raise QFileNotFoundException("Unknown quam data path")
    return quam_abs_path


def get_data_node_dir(
    snapshot_path: Path, quam_dir_name: str = "quam_state"
) -> Optional[Path]:
    quam_state_dir = snapshot_path / quam_dir_name
    return quam_state_dir if quam_state_dir.is_dir() else None


def update_state_file(state_file: Path, new_quam: Mapping[str, Any]) -> None:
    with state_file.open("w") as f:
        json.dump(new_quam, f, indent=4)


def update_state_dir(
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
        state_content = read_quam_content(state_file)

        new_state_content = {}
        for component in state_content:
            new_state_content[component] = copied.pop(component)

        update_state_file(state_file, new_state_content)
    if len(copied) > 0:
        logger.warning(
            "Not all root items of the new quam state have been saved to the "
            f"QUAM state directory {state_dir}."
        )


def update_active_machine_path(
    settings: QualibrateConfig, new_quam: Mapping[str, Any]
) -> None:
    am_path = get_quam_state_path(settings)
    if not am_path:
        logger.info("No active machine path to update")
        return
    if am_path.is_dir():
        logger.info(f"Updating quam state dir {am_path}")
        update_state_dir(am_path, new_quam)
        return
    logger.info(f"Updating quam state file {am_path}")
    am_path.write_text(json.dumps(new_quam, indent=4))


def read_quam_content(quam_path: Path) -> dict[str, Any]:
    if quam_path.is_file():
        with quam_path.open() as f:
            return dict(json.load(f))
    quam = {}
    for file in quam_path.glob("*.json"):
        try:
            with file.open() as f:
                quam.update(json.load(f))
        except json.JSONDecodeError as e:
            logger.exception(
                f"Failed to json decode quam file: {file.name}", exc_info=e
            )
        except ValueError as e:
            logger.warning(f"Invalid quam file: {file.name}", exc_info=e)
    return quam


def read_data_node_content(
    node_info: Mapping[str, Any],
    node_filepath: Path,
    snapshot_path: Path,
    settings: QualibrateConfig,
) -> dict[str, Any]:
    """Read quam data based on node info.

    Args:
        node_info: Node content
        node_filepath: path to file that contains node info
        snapshot_path: Node root
    """
    quam_path = get_data_node_path(node_info, node_filepath, snapshot_path)
    node_data = dict(node_info.get("data", {}))
    other_data = {
        "parameters": dict(node_data.get("parameters", {})).get("model"),
        "outcomes": node_data.get("outcomes"),
    }
    if quam_path is None:
        return {"quam": None, **other_data}
    return {"quam": read_quam_content(quam_path), **other_data}


def default_snapshot_content_updater(
    snapshot_path: NodePath,
    new_snapshot: Mapping[str, Any],
    patches: Sequence[Mapping[str, Any]],
    settings: QualibrateConfig,
) -> bool:
    node_filepath = get_node_filepath(snapshot_path)
    if not node_filepath.is_file():
        return False
    node_info = default_snapshot_content_loader_from_flag(
        snapshot_path, SnapshotLoadTypeFlag.DataWithMachine, settings, raw=True
    )
    quam_path = get_data_node_path(node_info, node_filepath, snapshot_path)
    if quam_path is None:
        return False
    new_quam = new_snapshot["quam"]
    if quam_path.is_file():
        update_state_file(quam_path, new_quam)
        optional_quam_dir = quam_path.parent / "quam_state"
        if optional_quam_dir.is_dir():
            update_state_dir(optional_quam_dir, new_quam)
    else:
        update_state_dir(quam_path, new_quam)
        optional_quam_file = quam_path.parent / "quam_state.json"
        if optional_quam_file.is_file():
            update_state_file(optional_quam_file, new_quam)
    node_info = dict(node_info)
    if "patches" in node_info:
        if not isinstance(node_info["patches"], list):
            raise QValueException("Patches is not sequence")
        node_info["patches"].extend(patches)
    else:
        node_info["patches"] = patches
    with node_filepath.open("w") as f:
        json.dump(node_info, f, indent=4)
    update_active_machine_path(settings, new_quam)
    return True


def _node_info_from_node_filename(node_filepath: Path) -> DocumentType:
    if not node_filepath.is_file():
        return {}
    with node_filepath.open("r") as f:
        try:
            return dict(json.load(f))
        except json.JSONDecodeError:
            return {}


def default_snapshot_content_loader(
    snapshot_path: NodePath,
    load_type: SnapshotLoadType,
    settings: QualibrateConfig,
    raw: bool = False,
) -> DocumentType:
    node_filepath = get_node_filepath(snapshot_path)
    node_info = _node_info_from_node_filename(node_filepath)
    if raw:
        return cast(DocumentType, node_info)
    content = read_minified_node_content(
        node_info, node_filepath, snapshot_path, settings
    )
    if load_type < SnapshotLoadType.Metadata:
        return content
    content["metadata"] = read_metadata_node_content(
        node_info, node_filepath, snapshot_path, settings
    )
    if load_type < SnapshotLoadType.Data:
        return content
    content["data"] = read_data_node_content(
        node_info, node_filepath, snapshot_path, settings
    )
    return content


def load_minified_from_node_content(
    node_info: Mapping[str, Any],
    node_filepath: Path,
    snapshot_path: NodePath,
    settings: QualibrateConfig,
    snapshot_info: dict[str, Any],
) -> None:
    snapshot_info.update(
        read_minified_node_content(
            node_info, node_filepath, snapshot_path, settings
        )
    )


def load_snapshot_metadata_from_node_content(
    node_info: Mapping[str, Any],
    node_filepath: Path,
    snapshot_path: NodePath,
    settings: QualibrateConfig,
    snapshot_info: dict[str, Any],
) -> None:
    metadata = read_metadata_node_content(
        node_info,
        node_filepath,
        snapshot_path,
        settings,
    )
    snapshot_info.update({"metadata": metadata})


def load_snapshot_data_without_refs_from_node_content(
    node_info: Mapping[str, Any],
    node_filepath: Path,
    snapshot_path: NodePath,
    settings: QualibrateConfig,
    snapshot_info: dict[str, Any],
) -> None:
    data = dict(node_info.get("data", {}))
    data.pop("quam", None)
    data.pop("machine", None)
    data.pop("results", None)
    snapshot_info.update({"data": data})


def load_snapshot_data_machine_from_node_content(
    node_info: Mapping[str, Any],
    node_filepath: Path,
    snapshot_path: NodePath,
    settings: QualibrateConfig,
    snapshot_info: dict[str, Any],
) -> None:
    quam_path = get_data_node_path(node_info, node_filepath, snapshot_path)
    # TODO: expected behaviour?
    quam_data = read_quam_content(quam_path) if quam_path else None
    snapshot_info["data"]["quam"] = quam_data


def load_snapshot_data_results_from_node_content(
    node_info: Mapping[str, Any],
    node_filepath: Path,
    snapshot_path: NodePath,
    settings: QualibrateConfig,
    snapshot_info: dict[str, Any],
) -> None:
    storage = DataFileStorage(snapshot_path, settings)
    storage.load_from_flag(StorageLoadTypeFlag.DataFileWithoutRefs)
    snapshot_info["data"]["results"] = storage.data


def load_snapshot_data_results_with_imgs_from_node_content(
    node_info: Mapping[str, Any],
    node_filepath: Path,
    snapshot_path: NodePath,
    settings: QualibrateConfig,
    snapshot_info: dict[str, Any],
) -> None:
    storage = DataFileStorage(snapshot_path, settings)
    storage.load_from_flag(StorageLoadTypeFlag.DataFileWithImgs)
    snapshot_info["data"]["results"] = storage.data


LOAD_SNAPSHOT_FLAG_FUNC_TYPE = Callable[
    [Mapping[str, Any], Path, NodePath, QualibrateConfig, dict[str, Any]], None
]
LOADERS: dict[SnapshotLoadTypeFlag, LOAD_SNAPSHOT_FLAG_FUNC_TYPE] = {
    SnapshotLoadTypeFlag.Empty: lambda *args, **kwargs: None,
    SnapshotLoadTypeFlag.Minified: load_minified_from_node_content,
    SnapshotLoadTypeFlag.Metadata: load_snapshot_metadata_from_node_content,
    SnapshotLoadTypeFlag.DataWithoutRefs: (
        load_snapshot_data_without_refs_from_node_content
    ),
    SnapshotLoadTypeFlag.DataWithMachine: (
        load_snapshot_data_machine_from_node_content
    ),
    SnapshotLoadTypeFlag.DataWithResults: (
        load_snapshot_data_results_from_node_content
    ),
    SnapshotLoadTypeFlag.DataWithResultsWithImgs: (
        load_snapshot_data_results_with_imgs_from_node_content
    ),
}


def default_snapshot_content_loader_from_flag(
    snapshot_path: NodePath,
    load_type: SnapshotLoadTypeFlag,
    settings: QualibrateConfig,
    raw: bool = False,
    snapshot_content: Optional[dict[str, Any]] = None,
) -> DocumentType:
    if snapshot_content is None:
        snapshot_content = {}
    if load_type == SnapshotLoadTypeFlag.Empty:
        return snapshot_content
    node_filepath = get_node_filepath(snapshot_path)
    node_info = _node_info_from_node_filename(node_filepath)
    if raw:
        return cast(DocumentType, node_info)
    # TODO: Issue: Iterate over flag use only Minified value if qualibrate-app
    #  is part of qualibrate
    for lt in SnapshotLoadTypeFlag.__members__.values():
        if (
            load_type.is_set(lt)
            and lt <= load_type
            and (loader := LOADERS.get(lt))
        ):
            loader(
                node_info,
                node_filepath,
                snapshot_path,
                settings,
                snapshot_content,
            )
    return snapshot_content
