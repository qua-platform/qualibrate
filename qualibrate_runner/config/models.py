from pathlib import Path
from typing import Any, Callable, Mapping, Optional, Union

from pydantic import BaseModel, ConfigDict, DirectoryPath, ImportString
from pydantic_settings import BaseSettings, SettingsConfigDict
from qualibrate.qualibration_graph import QualibrationGraph
from qualibrate.qualibration_library import QualibrationLibrary
from qualibrate.qualibration_node import QualibrationNode

from qualibrate_runner.core.models.last_run import LastRun, RunStatus


class State(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    passed_parameters: Mapping[str, Any] = {}
    last_run: Optional[LastRun] = None
    run_item: Optional[Union[QualibrationNode, QualibrationGraph]] = None

    @property
    def is_running(self) -> bool:
        return (
            self.last_run is not None
            and self.last_run.status == RunStatus.RUNNING
        )


class QualibrateRunnerSettings(BaseSettings):
    model_config = SettingsConfigDict(frozen=True)

    calibration_library_resolver: ImportString[
        Callable[[Path], QualibrationLibrary]
    ]
    calibration_library_folder: DirectoryPath
