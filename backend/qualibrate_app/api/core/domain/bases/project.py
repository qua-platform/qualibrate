from abc import ABC, abstractmethod
from collections.abc import Mapping, Sequence
from copy import deepcopy
from pathlib import Path
from typing import Any

from qualibrate_config.file import read_config_file
from qualibrate_config.models import QualibrateConfig
from qualibrate_config.references.resolvers import resolve_references
from qualibrate_config.vars import QUALIBRATE_CONFIG_KEY

from qualibrate_app.api.core.domain.bases.base_with_settings import (
    DomainWithConfigBase,
)
from qualibrate_app.api.core.models.project import Project


class ProjectsManagerBase(DomainWithConfigBase, ABC):
    def __init__(self, settings: QualibrateConfig, config_path: Path):
        super().__init__(settings)
        self._config_path = config_path

    @property
    def project(self) -> str:
        return self._settings.project

    @project.setter
    def project(self, value: str) -> None:
        self._active_project_setter(value)

    @abstractmethod
    def _active_project_setter(self, value: str) -> None:
        pass

    def _set_user_storage_project(self, project_name: str) -> None:
        self._settings.project = project_name

    @abstractmethod
    def create(self, project_name: str) -> str:
        pass

    @abstractmethod
    def list(self) -> Sequence[Project]:
        pass

    def _get_raw_and_resolved_ref_config(
        self, project_name: str
    ) -> tuple[Mapping[str, Any], Mapping[str, Any]]:
        raw_config = read_config_file(self._config_path, solve_references=False)
        # TODO: over way to update project;
        old_project_name = raw_config[QUALIBRATE_CONFIG_KEY]["project"]
        if old_project_name == project_name:
            return raw_config, deepcopy(raw_config)
        raw_config[QUALIBRATE_CONFIG_KEY]["project"] = project_name
        new_config = resolve_references(raw_config)
        if (
            new_config[QUALIBRATE_CONFIG_KEY]["storage"]["location"]
            == raw_config[QUALIBRATE_CONFIG_KEY]["storage"]["location"]
        ):
            # there is no reference in config
            project_path = Path(
                new_config[QUALIBRATE_CONFIG_KEY]["storage"]["location"]
            )
            new_project_path = self._resolve_new_project_path(
                project_name, old_project_name, project_path
            )
            new_config[QUALIBRATE_CONFIG_KEY]["storage"]["location"] = str(
                new_project_path
            )
        return raw_config, new_config

    @classmethod
    def _resolve_base_projects_path(
        cls, project_name: str, user_storage: Path
    ) -> Path:
        if project_name not in user_storage.parts:
            # project name isn't part of user storage path;
            # use parent dir as base path.
            return user_storage.parent
        project_name_index_from_end = tuple(reversed(user_storage.parts)).index(
            project_name
        )
        return user_storage.parents[project_name_index_from_end]

    @classmethod
    def _resolve_new_project_path(
        cls,
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
        base_project_path = cls._resolve_base_projects_path(
            current_project_name, current_user_storage
        )
        return base_project_path.joinpath(
            new_project_name,
            *current_user_storage.parts[project_name_index_from_start + 1 :],
        )
