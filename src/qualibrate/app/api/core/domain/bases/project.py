import logging
from abc import ABC, abstractmethod
from collections.abc import Sequence
from pathlib import Path

from qualibrate_config.core.project.create import create_project
from qualibrate_config.core.project.delete import delete_project
from qualibrate_config.core.project.update import update_project
from qualibrate_config.models import DatabaseStateConfig, DBConfig, QualibrateConfig

from qualibrate.app.api.core.domain.bases.base_with_settings import (
    DomainWithConfigBase,
)
from qualibrate.app.api.core.models.project import Project
from qualibrate.app.api.exceptions.classes.values import QValueException
from qualibrate.core.infrastructure.DB.DBRegistry import DBRegistry


class ProjectsManagerBase(DomainWithConfigBase, ABC):
    def __init__(self, settings: QualibrateConfig, config_path: Path):
        super().__init__(settings)
        self._config_path = config_path

    @property
    def project(self) -> str | None:
        return self._active_project_getter()

    @project.setter
    def project(self, value: str) -> None:
        self._active_project_setter(value)

    def _active_project_getter(self) -> str | None:
        return self._settings.project

    @abstractmethod
    def _active_project_setter(self, value: str) -> None:
        pass

    def delete(self, project_name: str) -> None:
        try:
            delete_project(self._config_path, project_name)
        except RuntimeError as e:
            raise QValueException(f"Failed to delete project '{project_name}'") from e

    def update(
        self,
        project_name: str,
        storage_location: Path | None = None,
        calibration_library_folder: Path | None = None,
        quam_state_path: Path | None = None,
        database: DBConfig | None = None,
        database_state: DatabaseStateConfig | None = None,
    ) -> str:
        try:
            update_project(
                self._config_path,
                project_name,
                storage_location,
                calibration_library_folder,
                quam_state_path,
                database,
                database_state,
            )
        except ValueError as e:
            raise QValueException(f"Failed to update project '{project_name}': {e}") from e

        # Handle database connection state changes
        if database_state is not None:
            db_manager = DBRegistry.get()
            if database_state.is_connected:
                if not db_manager.is_connected(project_name):
                    try:
                        db_manager.db_connect(project_name)
                        logging.info(f"Connected to database for project {project_name}")
                    except RuntimeError as e:
                        logging.error(f"Could not connect to database for project {project_name}: {e}")
            else:
                if db_manager.is_connected(project_name):
                    try:
                        db_manager.db_disconnect(project_name)
                        logging.info(f"Disconnected from database for project {project_name}")
                    except Exception as e:
                        logging.error(f"Could not disconnect from database for project {project_name}: {e}")
                        raise QValueException(f"Could not disconnect project {project_name}: {e}") from e

        return project_name

    def create(
        self,
        project_name: str,
        storage_location: Path | None = None,
        calibration_library_folder: Path | None = None,
        quam_state_path: Path | None = None,
        database: DBConfig | None = None,
        db_state: DatabaseStateConfig | None = None,
    ) -> str:
        try:
            create_project(
                self._config_path,
                project_name,
                storage_location,
                calibration_library_folder,
                quam_state_path,
                database,
                db_state,
            )
        except ValueError as e:
            raise QValueException(f"Failed to create project '{project_name}': {e}") from e
        return project_name

    @abstractmethod
    def list(self) -> Sequence[Project]:
        pass
