from abc import ABC, abstractmethod
from copy import copy
from pathlib import Path
from typing import (
    TYPE_CHECKING,
    Any,
    Dict,
    Generic,
    Hashable,
    Mapping,
    Optional,
    Type,
    TypeVar,
    cast,
)

from pydantic import create_model

from qualibrate.outcome import Outcome
from qualibrate.parameters import RunnableParameters
from qualibrate.run_mode import RunModes
from qualibrate.run_summary.base import BaseRunSummary

if TYPE_CHECKING:
    from qualibrate import QualibrationLibrary

CreateParametersType = TypeVar("CreateParametersType", bound=RunnableParameters)
RunParametersType = TypeVar("RunParametersType", bound=RunnableParameters)


def file_is_calibration_instance(file: Path, klass: str) -> bool:
    if not file.is_file() or file.suffix != ".py":
        return False

    contents = file.read_text()
    return f"{klass}(" in contents


class QRunnable(ABC, Generic[CreateParametersType, RunParametersType]):
    modes = RunModes()

    def __init__(
        self,
        name: str,
        parameters: CreateParametersType,
        description: Optional[str] = None,
    ):
        self.name = name
        self.parameters_class = self.build_parameters_class_from_instance(
            parameters
        )
        self._parameters = self.parameters_class()
        self.description = description

        self.modes = self.__class__.modes.model_copy()
        self.filepath: Optional[Path] = None

        self._state_updates: dict[str, Any] = {}

        self.outcomes: Dict[Hashable, Outcome] = {}

    @staticmethod
    def build_parameters_class_from_instance(
        parameters: CreateParametersType,
    ) -> Type[CreateParametersType]:
        fields = {
            name: copy(field) for name, field in parameters.model_fields.items()
        }
        # TODO: additional research about more correct field copying way
        for param_name, param_value in parameters.model_dump().items():
            fields[param_name].default = param_value
        model = create_model(  # type: ignore
            parameters.__class__.__name__,
            __doc__=parameters.__class__.__doc__,
            __base__=parameters.__class__.__bases__,
            __module__=parameters.__class__.__module__,
            **{name: (info.annotation, info) for name, info in fields.items()},
        )
        return cast(Type[CreateParametersType], model)

    def serialize(self, **kwargs: Any) -> Mapping[str, Any]:
        return {
            "name": self.name,
            "parameters": self.parameters_class.serialize(),
            "description": self.description,
        }

    @property
    def state_updates(self) -> Mapping[str, Any]:
        return self._state_updates

    @abstractmethod
    def stop(self, **kwargs: Any) -> bool:
        pass

    @classmethod
    @abstractmethod
    def scan_folder_for_instances(
        cls, path: Path, library: "QualibrationLibrary"
    ) -> Dict[str, "QRunnable[CreateParametersType, RunParametersType]"]:
        pass

    @abstractmethod
    def run(self, **passed_parameters: Any) -> BaseRunSummary:
        pass

    @property
    def parameters(self) -> CreateParametersType:
        return self._parameters

    @parameters.setter
    def parameters(self, new_parameters: CreateParametersType) -> None:
        if self.modes.external and self._parameters is not None:
            return
        self._parameters.model_validate(new_parameters.model_dump())
        self._parameters = new_parameters
