from collections.abc import Mapping, MutableMapping
from typing import Any

from jsonpointer import resolve_pointer


def recursive_properties_solver(
    properties: MutableMapping[str, Any], schema: Mapping[str, Any]
) -> MutableMapping[str, Any]:
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
