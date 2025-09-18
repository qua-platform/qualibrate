from abc import ABC, abstractmethod
from collections.abc import Sequence
from pathlib import Path
from typing import Optional

from qualibrate_config.core.project.create import create_project
from qualibrate_config.models import QualibrateConfig

from qualibrate_app.api.core.domain.bases.base_with_settings import (
    DomainWithConfigBase,
)
from qualibrate_app.api.core.models.project import Project
from qualibrate_app.api.exceptions.classes.values import QValueException


class ProjectsManagerBase(DomainWithConfigBase, ABC):
    def __init__(self, settings: QualibrateConfig, config_path: Path):
        super().__init__(settings)
        self._config_path = config_path

    @property
    def project(self) -> Optional[str]:
        return self._active_project_getter()

    @project.setter
    def project(self, value: str) -> None:
        self._active_project_setter(value)

    def _active_project_getter(self) -> Optional[str]:
        return self._settings.project

    @abstractmethod
    def _active_project_setter(self, value: str) -> None:
        pass

    def create(
        self,
        project_name: str,
        storage_location: Optional[Path] = None,
        calibration_library_folder: Optional[Path] = None,
        quam_state_path: Optional[Path] = None,
    ) -> str:
        try:
            create_project(
                self._config_path,
                project_name,
                storage_location,
                calibration_library_folder,
                quam_state_path,
            )
        except ValueError as e:
            raise QValueException(
                f"Failed to create project '{project_name}'"
            ) from e
        return project_name

    @abstractmethod
    def list(self) -> Sequence[Project]:
        pass
