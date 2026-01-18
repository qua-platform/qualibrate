import json
import warnings
from collections.abc import Mapping, Sequence
from datetime import datetime
from itertools import chain
from pathlib import Path
from typing import Any, cast

import datamodel_code_generator as dmcg
from datamodel_code_generator.model import get_data_model_types
from datamodel_code_generator.parser.jsonschema import JsonSchemaParser
from pydantic import ConfigDict, Field, PydanticDeprecatedSince20  # noqa: F401

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
    get_node_quam_path,
    resolve_and_check_relative,
)

DATA_MODEL_TYPES = get_data_model_types(
    dmcg.DataModelType.PydanticV2BaseModel,
    target_python_version=dmcg.PythonVersion.PY_311,
)


def read_raw_node_file(
    node_filepath: Path,
    base_path: Path,
    raise_ex: bool = True,
) -> dict[str, Any]:
    """
    Reads and parses a JSON file into a dictionary.

    Args:
        node_filepath: Path to the JSON file to be read.
        base_path: Base path for relative path for errors.
        raise_ex: Whether to raise an exception if the JSON
            file cannot be parsed. Defaults to True.

    Returns:
        The parsed JSON data as a dictionary. Returns an
        empty dictionary if parsing fails and `raise_ex` is False.

    Raises:
        JSONDecodeError: If the JSON file cannot be parsed and `raise_ex`
        is True.
    """
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
    f_node_id: int | None,
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


def read_data_node_content(
    node_info: Mapping[str, Any], node_filepath: Path, node_dir: Path
) -> dict[str, Any] | None:
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
) -> Mapping[str, Any] | None:
    """
    Finds a node file in the given directory, reads the file, and processes
    the contents of the node.

    Args:
        node_dir: The directory containing the node files.
        node_id: The identifier of the node.
        base_path: The base path of all nodes for relative path operations.
        data_path_key: The key used to locate the data path in the node's
            content. Defaults to "data_path".

    Returns:
        A dictionary containing the processed node content, or None if the
        node file is not found.
    """
    node_filepath = get_node_filepath(node_dir)
    if not node_filepath.is_file():
        logger.error(f"Node file with id {node_id} wasn't found in {base_path}")
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
) -> tuple[Any | None, NodeParameters | Mapping[str, Any] | None]:
    """
    Parses the content of a node to extract its machine and parameters.

    Args:
        node_content: The content of the node as a dictionary.
        node_id: The identifier of the node.
        node_dir: The directory containing the node files.
        build_params_class: Whether to construct the parameters as a
            `NodeParameters` class instance.

    Returns:
        A tuple containing:
        - The machine object (`quam_machine`) if it exists, or None otherwise.
        - The parameters as a `NodeParameters` instance, a mapping, or None
          if no parameters are found or the format is invalid.
    """
    quam_machine = None
    if "data" in node_content:
        quam_path = get_node_quam_path(node_content["data"], node_dir)
        if quam_path is not None:
            quam_machine = QuamLoader().load(quam_path)
    parameters_data = node_content.get("data", {}).get("parameters")
    if parameters_data is None:
        return quam_machine, None
    if not isinstance(parameters_data, dict):
        return quam_machine, None
    parameters = load_parameters(parameters_data, node_id, build_params_class)
    return quam_machine, parameters


def _get_filename_and_subreference(
    filepath: str | Path,
) -> tuple[Path, str | None]:
    """
    Extracts the base filename and subreference from a given file path.

    Example:
        Detail about example (I'm feeding the chicken)
        ::
            _get_filename_and_subreference(
                "./arrays.npz#fit_results.qubitC3.resonator_frequency"
            )  # (Path("arrays.npz"), "fit_results.qubitC3.resonator_frequency")

    Args:
        filepath: The file path, which may include a subreference separated
            by a `#` character.

    Returns:
        A tuple containing:
        - The file path with the base filename (excluding the subreference).
        - The subreference as a string if present, or None otherwise.
    """
    filepath = Path(filepath)
    name_str = filepath.name
    name, *subref = name_str.split("#")
    clear_filepath = filepath.with_name(name)
    return clear_filepath, "#".join(subref) if len(subref) else None


def _check_supported_reference(
    filename: Any,
    supported_extensions: set[str],
) -> bool:
    """
    Checks if a given reference has a supported file extension.

    Args:
        filename: The value to be checked, expected to be a string representing
            a file path with an optional subreference.
        supported_extensions: A set of supported file extensions
            (e.g., {".npz", ".json"}).

    Returns:
        True if the reference has a supported file extension, False otherwise.
    """
    if not isinstance(filename, str) or "." not in filename:
        return False
    # remove ref from array.npz#ref
    filepath, _ = _get_filename_and_subreference(filename)
    return filepath.suffix in supported_extensions


def read_reference(
    reference: str,
    loaders: Sequence[BaseLoader],
    node_dir: Path,
) -> Any:
    """
    Resolves and loads a reference file using the provided loaders.

    Args:
        reference: The reference string, which includes the file path and
            optionally a subreference (e.g., "file.npz#subref").
        loaders: A sequence of loader instances used to load the files.
        node_dir: The base node directory against which the file path is
            resolved.

    Returns:
        The loaded content from the reference file if successfully processed
        by a loader, or the original reference string if the file cannot be
        resolved or loaded.

    """
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
    """
    Recursively resolves references within a nested dictionary.

    Args:
        raw_data: The dictionary containing potential reference values to
            resolve.
        loaders: A sequence of loader instances used to load reference files.
        supported_extensions: A set of file extensions that are supported for
            resolution.
        node_dir: The base directory for resolving relative file paths.

    Returns:
        None. The `raw_data` dictionary is modified in place, replacing
        reference values with their resolved content.
    """
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
    custom_loaders: Sequence[type[BaseLoader]] | None = None,
) -> dict[str, Any] | None:
    """
    Reads and processes node data (results), resolving references within the
    data.

    Args:
        node_dir: The directory containing the node files.
        node_id: The identifier of the node.
        base_path: The base path of all nodes for resolving relative paths and
            logging.
        custom_loaders: An optional sequence of custom loader classes to
            handle specific file types. Defaults to None.

    Returns:
        A dictionary containing the processed node data with resolved
        references, or None if the node file is not found.
    """
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
) -> NodeParameters | Mapping[str, Any] | None:
    """
    Loads and optionally builds a parameters class from the provided data.

    Args:
        parameters: A mapping containing the parameters data, including
            "model" and "schema".
        node_id: The identifier of the node, used to generate a unique class
            name.
        build_params_class: Whether to build a custom parameters class based
            on the provided schema.

    Returns:
        - If `build_params_class` is False, returns the model dump (dict)
          directly from the `parameters` mapping.
        - If `build_params_class` is True, returns an instance of the
          dynamically created `NodeParameters` subclass, or None if the schema
          or model is missing or the class cannot be built.

    Notes:
        This function dynamically generates and executes a Python class
        definition based on the provided JSON schema.
    """
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
        additional_imports=["datetime.datetime", "pydantic.ConfigDict"],
        dump_resolve_reference_action=(
            DATA_MODEL_TYPES.dump_resolve_reference_action
        ),
    )
    # PydanticDeprecatedSince20
    with warnings.catch_warnings():
        warnings.simplefilter("ignore", category=PydanticDeprecatedSince20)
        model_class_str = str(parser.parse())
        # TODO: check why ConfigDict should be imported in this file
        #   (but not in exec code)
        exec(model_class_str)
    params_class = locals().get(class_name)

    if params_class is None:
        logger.error("Can't build parameters class correctly")
    return cast(NodeParameters, params_class).model_validate(model)
