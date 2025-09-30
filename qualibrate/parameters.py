import sys
from collections.abc import Mapping, Sequence
from typing import (
    Any,
    ClassVar,
    cast,
)

from pydantic import BaseModel, ConfigDict, Field, model_validator

from qualibrate.utils.exceptions import TargetsFieldNotExist
from qualibrate.utils.logger_m import logger
from qualibrate.utils.naming import get_full_class_path
from qualibrate.utils.parameters import recursive_properties_solver
from qualibrate.utils.type_protocols import TargetType
from qualibrate.utils.types_parsing import types_conversion

if sys.version_info >= (3, 11):
    from typing import Self
else:
    from typing_extensions import Self


__all__ = [
    "ExecutionParameters",
    "GraphParameters",
    "NodeParameters",
    "NodesParameters",
    "RunnableParameters",
]


class RunnableParameters(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        use_attribute_docstrings=True,
    )

    @classmethod
    def serialize(cls, **kwargs: Any) -> Mapping[str, Any]:
        schema = cls.model_json_schema()
        properties = schema["properties"]
        return recursive_properties_solver(properties, schema)

    @model_validator(mode="before")
    @classmethod
    def types_conversion(cls, data: Mapping[str, Any]) -> Mapping[str, Any]:
        return cast(Mapping[str, Any], types_conversion(data, cls.serialize()))


class TargetParameter(BaseModel):
    targets_name: ClassVar[str | None] = None

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
        if self.targets_name not in self.__class__.model_fields:
            return self
        if self.targets is not None and not isinstance(self.targets, Sequence):
            raise AssertionError(f"Targets must be an iterable of {TargetType}")
        return self

    @property
    def targets(self) -> list[TargetType] | None:
        if (
            self.targets_name is None
            or self.targets_name not in self.__class__.model_fields
        ):
            return None
        return cast(list[TargetType], getattr(self, self.targets_name))

    @targets.setter
    def targets(self, new_targets: Sequence[TargetType]) -> None:
        if self.targets_name is None:
            return
        if self.targets_name not in self.__class__.model_fields:
            raise TargetsFieldNotExist(
                f"Targets name ({self.targets_name}) specified but field does "
                "not exist"
            )
        if not isinstance(new_targets, Sequence):
            raise ValueError(f"Targets must be an iterable of {TargetType}")
        setattr(self, self.targets_name, new_targets)

    @classmethod
    def serialize_targets(
        cls,
        parameters: Mapping[str, Any],
        exclude_targets: bool = False,
    ) -> Mapping[str, Any]:
        if exclude_targets:
            return {
                k: {**v, "is_targets": False}
                for k, v in parameters.items()
                if k != cls.targets_name
            }
        else:
            return {
                k: {**v, "is_targets": k == cls.targets_name}
                for k, v in parameters.items()
            }


class NodeParameters(RunnableParameters, TargetParameter):
    targets_name: ClassVar[str | None] = "qubits"

    @classmethod
    def serialize(
        cls, exclude_targets: bool = False, **kwargs: Any
    ) -> Mapping[str, Any]:
        return cls.serialize_targets(
            super().serialize(),
            exclude_targets,
        )


class NodesParameters(RunnableParameters):
    pass


class GraphParameters(RunnableParameters, TargetParameter):
    targets_name: ClassVar[str | None] = "qubits"

    @classmethod
    def serialize(
        cls, exclude_targets: bool = False, **kwargs: Any
    ) -> Mapping[str, Any]:
        return cls.serialize_targets(super().serialize(), exclude_targets)


class OrchestratorParameters(RunnableParameters):
    pass


class ExecutionParameters(RunnableParameters):
    parameters: GraphParameters = Field(default_factory=GraphParameters)
    nodes: NodesParameters = Field(default_factory=NodesParameters)

    @classmethod
    def serialize(cls, **kwargs: Any) -> Mapping[str, Any]:
        serialized = super().serialize()
        updated_serialized = {}
        if len(serialized) > 2:
            updated_serialized = {
                k: v
                for k, v in serialized.items()
                if k not in ("parameters", "nodes")
            }
        exclude_targets = kwargs.get("exclude_targets")
        exclude_parameters_targets = (
            exclude_targets if exclude_targets is not None else False
        )
        exclude_nodes_targets = (
            exclude_targets if exclude_targets is not None else True
        )
        parameters_class = cls.model_fields["parameters"].annotation
        if parameters_class is None:
            raise RuntimeError("Graph parameters class can't be none")
        if not issubclass(parameters_class, GraphParameters):
            raise RuntimeError(
                "Graph parameters class should be subclass of "
                f"{get_full_class_path(GraphParameters)}"
            )

        updated_serialized["parameters"] = parameters_class.serialize_targets(
            serialized["parameters"], exclude_targets=exclude_parameters_targets
        )
        updated_serialized["nodes"] = {
            node_name: NodeParameters.serialize_targets(
                params, exclude_targets=exclude_nodes_targets
            )
            for node_name, params in serialized["nodes"].items()
        }

        return updated_serialized
