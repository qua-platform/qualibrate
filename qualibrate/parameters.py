import sys
from typing import Any, Hashable, Mapping, Optional, Sequence

from qualibrate.utils.parameters import recursive_properties_solver
from qualibrate.utils.type_protocols import TargetType

if sys.version_info >= (3, 11):
    from typing import Self
else:
    from typing_extensions import Self

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
        schema = cls.model_json_schema()
        properties = schema["properties"]
        return recursive_properties_solver(properties, schema)


class TargetParameter(BaseModel):
    targets_name: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def prepare_targets(cls, data: Mapping[str, Any]) -> Mapping[str, Any]:
        if data.get("targets") is None:
            return data
        targets = data.get("targets")
        default_targets_name = cls.model_fields["targets_name"].default
        targets_name = data.get("targets_name") or default_targets_name
        if targets_name is None:
            raise AssertionError("Targets specified without targets name")
        return {**data, targets_name: targets}

    @model_validator(mode="after")
    def targets_exists_if_specified(self) -> Self:
        if self.targets_name is None:
            return self
        if (
            self.targets_name is not None
            and self.targets_name not in self.model_fields
        ):
            raise AssertionError("targets_name should be one of model fields")
        return self

    @computed_field
    def targets(self) -> Optional[Sequence[TargetType]]:
        if self.targets_name is None:
            return None
        return getattr(self, self.targets_name)

    @targets.setter  # type: ignore[no-redef]
    def targets(self, new_targets: Sequence[Hashable]) -> None:
        if self.targets_name is None:
            return
        setattr(self, self.targets_name, new_targets)


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
