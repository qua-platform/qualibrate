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


class ExecutionParameters(RunnableParameters):
    parameters: GraphParameters
    nodes: NodesParameters

    @classmethod
    def serialize(cls) -> Mapping[str, Any]:
        # TODO: recursively resolve refs
        schema = cls.model_json_schema()
        properties = schema["properties"]
        graph_parameters = properties.pop("parameters")
        nodes_parameters = properties.pop("nodes")
        graph_class = resolve_pointer(schema, graph_parameters["$ref"][1:])
        nodes_class = resolve_pointer(schema, nodes_parameters["$ref"][1:])
        graph_params = graph_class["properties"]
        nodes_params = {
            name: resolve_pointer(schema, ref["$ref"][1:])["properties"]
            for name, ref in nodes_class["properties"].items()
        }
        to_return = {
            "parameters": graph_params,
            "nodes": nodes_params,
        }
        return to_return
