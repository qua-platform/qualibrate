from typing import Any, Mapping, cast

from jsonpointer import resolve_pointer
from pydantic import BaseModel

__all__ = [
    "ExecutionParameters",
    "GraphParameters",
    "NodeParameters",
    "NodesParameters",
    "RunnableParameters",
]


class RunnableParameters(BaseModel):
    @classmethod
    def serialize(cls) -> Mapping[str, Any]:
        return cast(Mapping[str, Any], cls.model_json_schema()["properties"])


class NodeParameters(RunnableParameters):
    pass


class NodesParameters(RunnableParameters):
    pass


class GraphParameters(RunnableParameters):
    pass


class ExecutionParameters(GraphParameters):
    nodes_parameters: NodesParameters

    @classmethod
    def serialize(cls) -> Mapping[str, Any]:
        # TODO: recursively resolve refs
        schema = cls.model_json_schema()
        properties = schema["properties"]
        nodes_parameters = properties.pop("nodes_parameters")
        graph_params = {
            prop_name: (
                resolve_pointer(schema, prop["$ref"][1:])["properties"]
                if "$ref" in prop
                else prop
            )
            for prop_name, prop in properties.items()
        }
        nodes_class = resolve_pointer(schema, nodes_parameters["$ref"][1:])
        nodes_params = {
            name: resolve_pointer(schema, ref["$ref"][1:])["properties"]
            for name, ref in nodes_class["properties"].items()
        }
        to_return = {
            "parameters": graph_params,
            "nodes_parameters": nodes_params,
        }
        return to_return
