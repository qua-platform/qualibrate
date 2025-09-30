from abc import ABC, abstractmethod
from collections.abc import Mapping
from contextvars import ContextVar
from copy import copy
from datetime import datetime
from pathlib import Path
from typing import (
    Any,
    Generic,
    TypeVar,
    cast,
)

from pydantic import create_model

from qualibrate.models.outcome import Outcome
from qualibrate.models.run_mode import RunModes
from qualibrate.models.run_summary.base import BaseRunSummary
from qualibrate.parameters import RunnableParameters
from qualibrate.utils.logger_m import logger
from qualibrate.utils.type_protocols import TargetType

CreateParametersType = TypeVar("CreateParametersType", bound=RunnableParameters)
RunParametersType = TypeVar("RunParametersType", bound=RunnableParameters)


def file_is_calibration_instance(file: Path, klass: str) -> bool:
    if not file.is_file() or file.suffix != ".py":
        return False

    contents = file.read_text()
    return f"{klass}(" in contents or f"{klass}[" in contents


run_modes_ctx: ContextVar[RunModes | None] = ContextVar(
    "run_modes", default=None
)


class QRunnable(ABC, Generic[CreateParametersType, RunParametersType]):
    """
    Abstract base class representing a runnable task.

    Args:
        name: The name of the runnable.
        parameters: Parameters to initialize the runnable.
        description: Description of the runnable.
        modes: Optional run modes for the runnable.
    """

    modes = RunModes()

    def __init__(
        self,
        name: str,
        parameters: CreateParametersType,
        description: str | None = None,
        *,
        modes: RunModes | None = None,
    ):
        self.name = name
        self.parameters_class = self.build_parameters_class_from_instance(
            parameters, True
        )
        self._parameters = self.parameters_class()
        self.description = description

        self.modes = self.get_run_modes(modes)

        self.filepath: Path | None = None

        self._state_updates: dict[str, Any] = {}

        self.outcomes: dict[TargetType, Outcome] = {}
        self.run_summary: BaseRunSummary | None = None

    def cleanup(self) -> None:
        """
        Cleans up the state of the runnable.

        Sets `run_summary` to None.
        """
        self.run_summary = None

    @property
    def run_end(self) -> datetime | None:
        return self.run_summary.completed_at if self.run_summary else None

    @staticmethod
    def build_parameters_class_from_instance(
        parameters: CreateParametersType,
        use_passed_as_base: bool = False,
    ) -> type[CreateParametersType]:
        """
        Builds a parameter class from a given instance.

        Args:
            parameters (CreateParametersType): The parameters instance.
            use_passed_as_base (bool): inherit parameters class if True
                otherwise use its bases

        Returns:
            A new parameter class type.
        """
        fields = {
            name: copy(field)
            for name, field in parameters.__class__.model_fields.items()
        }
        for param_name, param_value in parameters.model_dump().items():
            fields[param_name].default = param_value
        klass = parameters.__class__
        base = (klass,) if use_passed_as_base else klass.__bases__
        model = create_model(  # type: ignore
            parameters.__class__.__name__,
            __doc__=parameters.__class__.__doc__,
            __base__=base,
            __module__=parameters.__class__.__module__,
            **{name: (info.annotation, info) for name, info in fields.items()},
        )
        if hasattr(parameters, "targets_name"):
            model.targets_name = parameters.targets_name
        return cast(type[CreateParametersType], model)

    @classmethod
    def get_run_modes(cls, modes: RunModes | None = None) -> RunModes:
        """
        Determines the run modes for the QRunnable.
        If modes are provided, they are returned.
        If no modes are provided, the context run modes are returned.
        If no context run modes are provided, the default run modes are
        returned.

        Args:
            modes (Optional[RunModes]): Run modes, if provided.

        Returns:
            RunModes: The resolved run modes.
        """
        if modes is not None:
            return modes

        context_run_modes = run_modes_ctx.get()
        if context_run_modes is not None:
            return context_run_modes.model_copy()
        elif cls.modes is not None:
            return cls.modes.model_copy()
        else:
            logger.warning("Run modes were not provided. Using default")
            return RunModes()

    def serialize(self, **kwargs: Any) -> Mapping[str, Any]:
        """
        Serializes the runnable into a dictionary representation.

        Args:
            **kwargs (Any): Additional keyword arguments.

        Returns:
            Mapping[str, Any]: Serialized dictionary representation.
        """
        return {
            "name": self.name,
            "parameters": self.parameters_class.serialize(**kwargs),
            "description": self.description,
        }

    @property
    def state_updates(self) -> Mapping[str, Any]:
        """
        Gets the state updates of the runnable.

        Returns:
            Mapping[str, Any]: A dictionary of state updates.
        """
        return self._state_updates

    @abstractmethod
    def stop(self, **kwargs: Any) -> bool:
        """
        Stops the runnable.

        Args:
            **kwargs (Any): Additional arguments.

        Returns:
            bool: True if stopped successfully, False otherwise.
        """
        pass

    @classmethod
    @abstractmethod
    def scan_folder_for_instances(
        cls, path: Path
    ) -> dict[str, "QRunnable[CreateParametersType, RunParametersType]"]:
        """
        Scans a folder for runnable instances.

        Args:
            path (Path): The folder path to scan.

        Returns:
            dict[str, QRunnable]: A dictionary of runnable instances.
        """
        pass

    @abstractmethod
    def run(self, **passed_parameters: Any) -> BaseRunSummary:
        """
        Runs the runnable with the provided parameters.

        Args:
            **passed_parameters (Any): Parameters to run the runnable.

        Returns:
            tuple[QRunnable, BaseRunSummary]: The executed runnable and summary.
        """
        pass

    @property
    def parameters(self) -> CreateParametersType:
        """
        Gets the parameters of the runnable.

        Returns:
            CreateParametersType: The parameters instance.
        """
        return self._parameters

    @parameters.setter
    def parameters(self, new_parameters: CreateParametersType) -> None:
        """
        Sets new parameters for the runnable.
        If external mode is enabled and parameters already specified that new
        parameters won't be assigned.

        Args:
            new_parameters (CreateParametersType): New parameters to set.
        """
        if self.modes.external and self._parameters is not None:
            return
        self._parameters.model_validate(new_parameters.model_dump())
        self._parameters = new_parameters
