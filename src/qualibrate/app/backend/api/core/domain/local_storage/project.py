from collections.abc import Sequence

from qualibrate_config.core.project.active import get_active_project
from qualibrate_config.core.project.p_list import verbose_list_projects
from qualibrate_config.core.project.switch import switch_project

from qualibrate_app.api.core.domain.bases.project import ProjectsManagerBase
from qualibrate_app.api.core.models.project import Project
from qualibrate_app.api.exceptions.classes.values import QValueException
from qualibrate_app.config import get_settings


class ProjectsManagerLocalStorage(ProjectsManagerBase):
    def _active_project_getter(self) -> str | None:
        return get_active_project(self._config_path)

    def _active_project_setter(self, value: str) -> None:
        try:
            switch_project(self._config_path, value, raise_if_error=True)
        except ValueError as e:
            raise QValueException(str(e)) from e
        get_settings.cache_clear()
        self._settings = get_settings(self._config_path)

    def list(self) -> Sequence[Project]:
        try:
            return [
                Project(**p.model_dump())
                for p in verbose_list_projects(self._config_path).values()
            ]
        except NotADirectoryError:
            return []
