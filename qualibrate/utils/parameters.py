from typing import Any, Dict, Mapping

from jsonpointer import resolve_pointer


def recursive_properties_solver(
    properties: Dict[str, Any], schema: Mapping[str, Any]
) -> Dict[str, Any]:
    for name, structure in properties.items():
        if "$ref" in structure:
            resolved = resolve_pointer(schema, structure["$ref"][1:])
            properties[name] = recursive_properties_solver(
                resolved["properties"], schema
            )
    return properties
