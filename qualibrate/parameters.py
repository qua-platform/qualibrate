import sys
from typing import Any, Mapping, Optional, cast

if sys.version_info >= (3, 11):
    from typing import Self
else:
    from typing_extensions import Self

from jsonpointer import resolve_pointer
from pydantic import BaseModel, computed_field, model_validator

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


class TargetParameter(BaseModel):
    targets_name: Optional[str] = None

    @model_validator(mode="after")
    def targets_exists_if_specified(self) -> Self:
        if self.targets_name is None:
            return self
        if (
            self.targets_name is not None
            and self.targets_name not in self.model_fields
        ):
            # self.model_fields["targets_name"].alias
            self.model_rebuild()
            raise AssertionError("targets_name should be one of model fields")
        return self

    @computed_field
    def targets(self) -> Any:
        if self.targets_name is None:
            return None
        return getattr(self, self.targets_name)


class NodeParameters(RunnableParameters, TargetParameter):
    pass


class NodesParameters(RunnableParameters):
    pass


class GraphParameters(RunnableParameters, TargetParameter):
    pass


class OrchestratorParameters(RunnableParameters):
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
