from pathlib import Path
from typing import Callable, Optional, Union

from pydantic import BaseModel, ConfigDict, DirectoryPath, ImportString
from pydantic_settings import BaseSettings, SettingsConfigDict

from qualibrate_runner.core.models.last_run import LastRun, RunStatus
from qualibrate_runner.core.types import QGraphType, QLibraryType, QNodeType


class State(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    last_run: Optional[LastRun] = None
    run_item: Optional[Union[QNodeType, QGraphType]] = None

    @property
    def is_running(self) -> bool:
        return (
            self.last_run is not None
            and self.last_run.status == RunStatus.RUNNING
        )


class QualibrateRunnerSettings(BaseSettings):
    model_config = SettingsConfigDict(frozen=True)

    calibration_library_resolver: ImportString[Callable[[Path], QLibraryType]]
    calibration_library_folder: DirectoryPath
