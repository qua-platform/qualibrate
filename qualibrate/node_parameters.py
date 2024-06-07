from typing import Any, Mapping

from pydantic import BaseModel

# https://docs.pydantic.dev/1.10/usage/schema/#json-schema-types
types_mapping = {
    "string": "str",
    "boolean": "bool",
    "number": "float",
    "integer": "int",
}


class NodeParameters(BaseModel):
    def serialize(self) -> list[Mapping[str, Any]]:
        schema = self.schema()
        # list type is array
        return [
            {
                "name": prop,
                "param_type": types_mapping[value["type"]],
                "initial_value": value.get("default")
            }
            for prop, value in schema["properties"].items()
        ]
