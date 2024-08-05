from abc import ABC, abstractmethod
from pathlib import Path
from typing import (
    TYPE_CHECKING,
    Any,
    Dict,
    Generic,
    Mapping,
    Optional,
    Type,
    TypeVar,
)

from qualibrate.parameters import RunnableParameters
from qualibrate.run_mode import RunMode

if TYPE_CHECKING:
    from qualibrate import QualibrationLibrary

ParametersType = TypeVar("ParametersType", bound=RunnableParameters)


def file_is_calibration_instance(file: Path, klass: str) -> bool:
    if not file.is_file() or file.suffix != ".py":
        return False

    contents = file.read_text()
    return f"{klass}(" in contents


class QRunnable(ABC, Generic[ParametersType]):
    mode = RunMode()

    def __init__(
        self,
        name: str,
        parameters_class: Type[ParametersType],
    ):
        self.name = name
        self.parameters_class = parameters_class

        self.mode = self.__class__.mode.model_copy()
        self.filepath: Optional[Path] = None
        self.__parameters: Optional[ParametersType] = None

    @abstractmethod
    def serialize(self) -> Mapping[str, Any]:
        pass

    @classmethod
    @abstractmethod
    def scan_folder_for_instances(
        cls, path: Path, library: "QualibrationLibrary"
    ) -> Dict[str, "QRunnable[ParametersType]"]:
        pass

    @abstractmethod
    def run(self, parameters: ParametersType) -> None:
        pass

    @property
    def parameters(self) -> Optional[ParametersType]:
        return self.__parameters

    @parameters.setter
    def parameters(self, new_parameters: ParametersType) -> None:
        if self.mode.external and self.__parameters is not None:
            return
        self.parameters_class.model_validate(new_parameters.model_dump())
        self.__parameters = new_parameters
