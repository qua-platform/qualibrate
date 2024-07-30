from typing import Any, Mapping, cast

from pydantic import BaseModel

__all__ = ["NodeParameters", "CommonGraphParameters", "GraphParameters"]


class RunnableParameters(BaseModel):
    @classmethod
    def serialize(cls) -> Mapping[str, Any]:
        return cast(Mapping[str, Any], cls.model_json_schema()["properties"])


class NodeParameters(RunnableParameters):
    pass


class CommonGraphParameters(RunnableParameters):
    pass


class GraphParameters(RunnableParameters):
    graph_parameters: CommonGraphParameters
    nodes_parameters: Mapping[str, NodeParameters]
