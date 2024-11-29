from collections.abc import Mapping, MutableMapping
from typing import Any

from jsonpointer import resolve_pointer


def recursive_properties_solver(
    properties: MutableMapping[str, Any], schema: Mapping[str, Any]
) -> MutableMapping[str, Any]:
    """
    Recursively resolves and simplifies properties in a schema by handling
    `$ref` and `allOf` constructs.

    Args:
        properties: A mapping of property names to their structures, which
            may include references (`$ref`) or combined definitions (`allOf`).
        schema: The full schema mapping used to resolve references.

    Returns:
        The updated properties mapping with resolved references and simplified
        structures.
    """
    for name, structure in properties.items():
        if (
            "allOf" in structure
            and len(structure["allOf"]) == 1
            and isinstance(structure["allOf"][0], Mapping)
        ):
            structure.update(structure.pop("allOf")[0])
        if "$ref" in structure:
            resolved = resolve_pointer(schema, structure["$ref"][1:])
            properties[name] = recursive_properties_solver(
                resolved["properties"], schema
            )
    return properties
