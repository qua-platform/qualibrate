from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any, Mapping, Sequence, Tuple

from qualibrate.api.core.models.project import Project
from qualibrate.config import (
    CONFIG_KEY,
    QualibrateSettings,
    get_config_path,
    get_settings,
    read_config_file,
)
from qualibrate.utils.config_references import resolve_references


class ProjectsManagerBase(ABC):
    @property
    def project(self) -> str:
        return get_settings().project

    @project.setter
    def project(self, value: str) -> None:
        self._active_project_setter(value)

    @abstractmethod
    def _active_project_setter(self, value: str) -> None:
        pass

    @abstractmethod
    def _set_user_storage_project(
        self, project_name: str, settings: QualibrateSettings
    ) -> None:
        pass

    @abstractmethod
    def create(self, project_name: str, settings: QualibrateSettings) -> str:
        pass

    @abstractmethod
    def list(self) -> Sequence[Project]:
        pass

    def _get_raw_and_resolved_ref_config(
        self, project_name: str
    ) -> Tuple[Mapping[str, Any], Mapping[str, Any]]:
        raw_config = read_config_file(get_config_path(), solve_references=False)
        # TODO: over way to update project
        raw_config[CONFIG_KEY]["project"] = project_name
        new_config = resolve_references(raw_config)
        return raw_config, new_config

    def _resolve_base_projects_path(
        self, project_name: str, user_storage: Path
    ) -> Path:
        if project_name not in user_storage.parts:
            # project name isn't part of user storage path;
            # use parent dir as base path.
            return user_storage.parent
        project_name_index_from_end = tuple(reversed(user_storage.parts)).index(
            project_name
        )
        return user_storage.parents[project_name_index_from_end]

    def _resolve_new_project_path(
        self,
        new_project_name: str,
        current_project_name: str,
        current_user_storage: Path,
    ) -> Path:
        if current_project_name not in current_user_storage.parts:
            # project name isn't part of user storage path;
            # use neighbour dir as new project path.
            return current_user_storage.parent / new_project_name
        project_name_index_from_start = current_user_storage.parts.index(
            current_project_name
        )
        base_project_path = self._resolve_base_projects_path(
            current_project_name, current_user_storage
        )
        return base_project_path.joinpath(
            new_project_name,
            *current_user_storage.parts[project_name_index_from_start + 1 :],
        )
