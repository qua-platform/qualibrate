from typing import Any, Mapping

from pydantic import BaseModel


class NodeParameters(BaseModel):
    def serialize(self) -> list[Mapping[str, Any]]:
        schema = self.schema()
        # list type is array
        return [
            {
                "name": prop,
                "param_type": value["type"],
                "initial_value": value.get("default")
            }
            for prop, value in schema["properties"].items()
        ]
