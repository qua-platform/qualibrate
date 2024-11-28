import json
from collections.abc import Mapping, Sequence
from datetime import datetime
from itertools import chain
from pathlib import Path
from typing import Any, Optional, Union, cast

import datamodel_code_generator as dmcg
from datamodel_code_generator.format import DatetimeClassType
from datamodel_code_generator.model import get_data_model_types
from datamodel_code_generator.parser.jsonschema import JsonSchemaParser
from pydantic import Field  # noqa: F401

from qualibrate import NodeParameters
from qualibrate.utils.logger_m import logger
from qualibrate.utils.node.loaders import (
    DEFAULT_LOADERS,
    SUPPORTED_EXTENSIONS,
    QuamLoader,
)
from qualibrate.utils.node.loaders.base_loader import BaseLoader
from qualibrate.utils.node.path_solver import (
    get_data_filepath,
    get_node_dir_path,
    get_node_filepath,
    get_node_quam_filepath,
    resolve_and_check_relative,
)

DATA_MODEL_TYPES = get_data_model_types(
    dmcg.DataModelType.PydanticV2BaseModel,
    target_python_version=dmcg.PythonVersion.PY_311,
    target_datetime_class=DatetimeClassType.Datetime,
)


def read_raw_node_file(
    node_filepath: Path,
    base_path: Path,
    raise_ex: bool = True,
) -> dict[str, Any]:
    try:
        with node_filepath.open("r") as f:
            return dict(json.load(f))
    except json.JSONDecodeError as ex:
        logger.exception(
            (
                "Can't read node json by path "
                f"{node_filepath.relative_to(base_path)}"
            ),
            exc_info=ex,
        )
        if raise_ex:
            raise
    return {}


def read_minified_node_content(
    node_info: Mapping[str, Any],
    f_node_id: Optional[int],
    node_filepath: Path,
    base_path: Path,
) -> dict[str, Any]:
    """
    Args:
        node_info: content of node file
        f_node_id: node id got from node path
        node_filepath: path to file with node info
        base_path: path to common node directory

    Returns:
        Minified content on node
    """
    node_id = node_info.get("id", f_node_id or -1)
    parents = node_info.get(
        "parents", [node_id - 1] if node_id and node_id > 0 else []
    )
    parents = list(
        filter(lambda p_id: get_node_dir_path(p_id, base_path), parents)
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


def read_metadata_node_content(
    node_info: Mapping[str, Any],
    node_dir: Path,
    base_path: Path,
    data_path_key: str,
) -> dict[str, Any]:
    """
    Args:
        node_info: content of node file
        node_dir: path to node node directory
        base_path: path to common node directory
        data_path_key: name of key referred to data files directory

    Returns:
        Minified content on node
    """
    node_metadata = dict(node_info.get("metadata", {}))
    node_metadata.setdefault(
        data_path_key,
        node_dir.relative_to(base_path),
    )
    return node_metadata


def get_data_node_filepath(
    node_info: Mapping[str, Any], node_filepath: Path, snapshot_path: Path
) -> Optional[Path]:
    node_data = dict(node_info.get("data", {}))
    quam_relative_path = node_data.get("quam", "./state.json")
    quam_file_path = node_filepath.parent.joinpath(quam_relative_path).resolve()
    if not quam_file_path.is_relative_to(snapshot_path):
        raise FileNotFoundError("Unknown quam data path")
    if quam_file_path.is_file():
        return quam_file_path
    return None


def read_data_node_content(
    node_info: Mapping[str, Any], node_filepath: Path, node_dir: Path
) -> Optional[dict[str, Any]]:
    """Read quam data based on node info.

    Args:
        node_info: Node content
        node_filepath: path to file that contains node info
        node_dir: Node root
    """
    return dict(node_info.get("data", {}))


def read_node_content(
    node_dir: Path,
    node_id: int,
    base_path: Path,
    data_path_key: str = "data_path",
) -> Optional[Mapping[str, Any]]:
    node_filepath = get_node_filepath(node_dir)
    if not node_filepath.is_file():
        logger.error(f"Node file with id {node_id} wasn't found in {node_id}")
        return None
    node_content = read_raw_node_file(node_filepath, base_path)
    content = read_minified_node_content(
        node_content, node_id, node_filepath, base_path
    )
    content["metadata"] = read_metadata_node_content(
        node_content, node_dir, node_dir, data_path_key
    )
    content["data"] = read_data_node_content(
        node_content, node_filepath, node_dir
    )
    return node_content


def parse_node_content(
    node_content: Mapping[str, Any],
    node_id: int,
    node_dir: Path,
    build_params_class: bool,
) -> tuple[Optional[Any], Optional[Union[NodeParameters, Mapping[str, Any]]]]:
    quam_machine = None
    if "data" in node_content:
        quam_filepath = get_node_quam_filepath(node_content["data"], node_dir)
        if quam_filepath is not None:
            quam_machine = QuamLoader().load(quam_filepath)
    parameters_data = node_content.get("data", {}).get("parameters")
    if parameters_data is None:
        return quam_machine, None
    if not isinstance(parameters_data, dict):
        return quam_machine, None
    parameters = load_parameters(parameters_data, node_id, build_params_class)
    return quam_machine, parameters


def _get_filename_and_subreference(
    filepath: Union[str, Path],
) -> tuple[Path, Optional[str]]:
    filepath = Path(filepath)
    name_str = filepath.name
    name, *subref = name_str.split("#")
    clear_filepath = filepath.with_name(name)
    return clear_filepath, "#".join(subref) if len(subref) else None


def _check_supported_reference(
    value: Any,
    supported_extensions: set[str],
) -> bool:
    if not isinstance(value, str) or "." not in value:
        return False
    filepath, _ = _get_filename_and_subreference(value)
    # remove ref from array.npz#ref
    return filepath.suffix in supported_extensions


def read_reference(
    reference: str,
    loaders: Sequence[BaseLoader],
    node_dir: Path,
) -> Any:
    filepath, subreference = _get_filename_and_subreference(reference)
    try:
        filepath = resolve_and_check_relative(node_dir, filepath)
    except FileNotFoundError as ex:
        logger.exception(
            f"File {filepath} can't be located inside node directory.",
            exc_info=ex,
        )
        return reference
    supported_loaders = list(
        filter(
            lambda loader: loader.is_loader_support_extension(filepath.suffix),
            loaders,
        )
    )
    for loader in supported_loaders:
        try:
            result = loader.load(filepath, subref=subreference)
            if result is None:
                continue
            return result
        except Exception as ex:
            logger.exception(
                f"Can't load reference ({reference}) by loader {loader}",
                exc_info=ex,
            )
    logger.warning(
        f"Reference {reference} was not loaded. Kept reference value."
    )
    return reference


def _resolve_references(
    raw_data: dict[str, Any],
    loaders: Sequence[BaseLoader],
    supported_extensions: set[str],
    node_dir: Path,
) -> None:
    for key, value in raw_data.items():
        if isinstance(value, dict):
            _resolve_references(value, loaders, supported_extensions, node_dir)
            raw_data[key] = value
        if not _check_supported_reference(value, supported_extensions):
            continue
        raw_data[key] = read_reference(value, loaders, node_dir)


def read_node_data(
    node_dir: Path,
    node_id: int,
    base_path: Path,
    custom_loaders: Optional[Sequence[type[BaseLoader]]] = None,
) -> Optional[dict[str, Any]]:
    data_filepath = get_data_filepath(node_dir)
    if not data_filepath.is_file():
        logger.error(f"Node file with id {node_id} wasn't found in {base_path}")
        return None
    results = read_raw_node_file(data_filepath, node_dir)
    loaders = [*custom_loaders] if custom_loaders is not None else []
    loaders.extend(DEFAULT_LOADERS)
    custom_supported_extensions = set(
        chain.from_iterable(
            loader.file_extensions for loader in DEFAULT_LOADERS
        )
    )
    loaders_instances = [loader() for loader in loaders]
    supported_extensions = custom_supported_extensions | SUPPORTED_EXTENSIONS
    _resolve_references(
        results, loaders_instances, supported_extensions, node_dir
    )
    return results


def load_parameters(
    parameters: Mapping[str, Any],
    node_id: int,
    build_params_class: bool,
) -> Optional[Union[NodeParameters, Mapping[str, Any]]]:
    model = parameters.get("model")
    if not build_params_class:
        return model
    schema = parameters.get("schema")
    if schema is None or model is None:
        return None
    class_name = f"LoadedNode{node_id}Parameters"
    parser = JsonSchemaParser(
        json.dumps(schema),
        data_model_type=DATA_MODEL_TYPES.data_model,
        data_model_root_type=DATA_MODEL_TYPES.root_model,
        data_model_field_type=DATA_MODEL_TYPES.field_model,
        data_type_manager_type=DATA_MODEL_TYPES.data_type_manager,
        use_standard_collections=True,
        use_generic_container_types=True,
        class_name=class_name,
        base_class="qualibrate.parameters.NodeParameters",
        additional_imports=["datetime.datetime"],
        dump_resolve_reference_action=(
            DATA_MODEL_TYPES.dump_resolve_reference_action
        ),
    )
    model_class_str = str(parser.parse())
    exec(model_class_str)
    params_class = locals().get(class_name)

    if params_class is None:
        logger.error("Can't build parameters class correctly")
    return cast(NodeParameters, params_class).model_validate(model)
