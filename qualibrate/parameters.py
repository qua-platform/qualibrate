import sys
from typing import (
    Any,
    ClassVar,
    List,
    Mapping,
    Optional,
    Sequence,
    cast,
)

from qualibrate.utils.logger_m import logger
from qualibrate.utils.parameters import recursive_properties_solver
from qualibrate.utils.type_protocols import TargetType
from qualibrate.utils.types_parsing import types_conversion

if sys.version_info >= (3, 11):
    from typing import Self
else:
    from typing_extensions import Self

from pydantic import BaseModel, Field, model_validator

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

    @model_validator(mode="before")
    @classmethod
    def types_conversion(cls, data: Mapping[str, Any]) -> Mapping[str, Any]:
        return cast(Mapping[str, Any], types_conversion(data, cls.serialize()))


class TargetParameter(BaseModel):
    targets_name: ClassVar[Optional[str]] = None

    @model_validator(mode="before")
    @classmethod
    def prepare_targets(cls, data: Mapping[str, Any]) -> Mapping[str, Any]:
        if "targets" not in data:
            return data
        targets = data.get("targets")
        if cls.targets_name is None:
            raise AssertionError("Targets specified without targets name")
        if cls.targets_name in data:
            msg = (
                f"You specified `targets` and `{cls.targets_name}` (marked as "
                f"targets name) fields. `{cls.targets_name}` will be ignored."
            )
            logger.warning(msg)
        targets = types_conversion(
            targets, cls.model_json_schema()["properties"].get(cls.targets_name)
        )
        return {**data, cls.targets_name: targets}

    @model_validator(mode="after")
    def targets_exists_if_specified(self) -> Self:
        if self.targets_name not in self.model_fields:
            return self
        if self.targets is not None and not isinstance(self.targets, Sequence):
            raise AssertionError(f"Targets must be an iterable of {TargetType}")
        return self

    @property
    def targets(self) -> Optional[List[TargetType]]:
        if (
            self.targets_name is None
            or self.targets_name not in self.model_fields
        ):
            return None
        return cast(List[TargetType], getattr(self, self.targets_name))

    @targets.setter
    def targets(self, new_targets: Sequence[TargetType]) -> None:
        if self.targets_name is None:
            return
        if self.targets_name not in self.model_fields:
            raise ValueError(
                f"Targets name ({self.targets_name}) specified but field does not exist"
            )
        if not isinstance(new_targets, Sequence):
            raise ValueError(f"Targets must be an iterable of {TargetType}")
        setattr(self, self.targets_name, new_targets)


class NodeParameters(RunnableParameters, TargetParameter):
    targets_name: ClassVar[Optional[str]] = "qubits"


class NodesParameters(RunnableParameters):
    pass


class GraphParameters(RunnableParameters, TargetParameter):
    targets_name: ClassVar[Optional[str]] = "qubits"

    qubits: List[TargetType] = Field(default_factory=list)


class OrchestratorParameters(RunnableParameters):
    pass


class ExecutionParameters(RunnableParameters):
    parameters: GraphParameters = Field(default_factory=GraphParameters)
    nodes: NodesParameters = Field(default_factory=NodesParameters)
