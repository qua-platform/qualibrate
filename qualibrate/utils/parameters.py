from typing import Any, Mapping, cast

from pydantic import BaseModel


class RunnableParameters(BaseModel):
    @classmethod
    def serialize(cls) -> Mapping[str, Any]:
        return cast(Mapping[str, Any], cls.model_json_schema()["properties"])


class NodeParameters(RunnableParameters):
    pass


class GraphParameters(RunnableParameters):
    graph_parameters: RunnableParameters
    nodes_parameters: Mapping[str, NodeParameters]
