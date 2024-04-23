from pathlib import Path
from typing import Sequence

from pydantic import ValidationError

from qualibrate.api.core.domain.bases.project import ProjectsManagerBase
from qualibrate.api.exceptions.classes.values import QValueException
from qualibrate.config import CONFIG_KEY, QualibrateSettings, get_settings


class ProjectsManagerLocalStorage(ProjectsManagerBase):
    def _active_project_setter(self, value: str) -> None:
        self._set_user_storage_project(value, get_settings())

    def _set_user_storage_project(
        self, project_name: str, settings: QualibrateSettings
    ) -> None:
        raw_config, new_config = self._get_raw_and_resolved_ref_config(
            project_name
        )
        try:
            qs = QualibrateSettings(**(new_config.get(CONFIG_KEY, {})))
        except ValidationError as ex:
            storage_not_exists = filter(
                lambda e: (
                    e["type"] == "path_not_directory"
                    and e["loc"] == ("user_storage",),
                ),
                ex.errors(include_url=False, include_input=False),
            )
            if next(storage_not_exists, None) is not None:
                raise QValueException(f"Invalid project name '{project_name}'")
            raise
        settings.project = qs.project
        settings.user_storage = qs.user_storage

    def create(self, project_name: str, settings: QualibrateSettings) -> str:
        new_project_path = self._resolve_new_project_path(
            project_name, settings.project, settings.user_storage
        )
        if new_project_path.is_dir():
            raise QValueException(f"Project {project_name} already exists.")
        new_project_path.mkdir(parents=True)
        return project_name

    def list(self) -> Sequence[str]:
        settings = get_settings()
        base_path = self._resolve_base_projects_path(
            settings.project, settings.user_storage
        )
        return list(
            map(lambda p: p.name, filter(Path.is_dir, base_path.iterdir()))
        )
