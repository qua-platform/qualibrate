from collections.abc import Mapping
from typing import Any

from pydantic import BaseModel


def calibration_nodes_resolver() -> Mapping[str, Any]:
    """Here should be list of nodes that will be defined later"""

    class Node:
        class Parameters(BaseModel):
            bool_val: bool = False
            float_val: float = 1.2
            int_val: int = 3
            str_val: str = "string_val"

        def __init__(self) -> None:
            self.name = "node_1"
            self.parameters = self.Parameters
            self.description = None

        def serialize(self) -> Mapping[str, Any]:
            return {
                "name": self.name,
                "parameters": self.parameters.model_json_schema(),
                "description": self.description,
            }

    return {"node_1": Node()}
