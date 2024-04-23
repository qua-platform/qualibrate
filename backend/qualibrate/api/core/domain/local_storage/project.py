from datetime import datetime
from pathlib import Path
from typing import Sequence, cast

from pydantic import ValidationError

from qualibrate.api.core.domain.bases.project import ProjectsManagerBase
from qualibrate.api.core.domain.local_storage.utils.node_utils import (
    get_node_id_name_time,
)
from qualibrate.api.core.models.project import Project
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

    def _get_project_info(self, project_path: Path) -> Project:
        project_created_at = datetime.fromtimestamp(
            project_path.stat().st_mtime
        ).astimezone()
        max_node_number_path = max(
            project_path.rglob("#*"),
            key=lambda n: get_node_id_name_time(n)[0] or -1,
            default=None,
        )
        if max_node_number_path is not None:
            max_node_num_id, _, max_node_number_time = get_node_id_name_time(
                max_node_number_path
            )
        else:
            max_node_num_id = None
            max_node_number_time = None
        max_node_number = max_node_num_id or -1
        if max_node_number_time is not None:
            last_modified_ts = (
                datetime.strptime(
                    cast(Path, max_node_number_path).parent.name, "%Y-%m-%d"
                )
                .replace(
                    hour=max_node_number_time.hour,
                    minute=max_node_number_time.minute,
                    second=max_node_number_time.second,
                )
                .astimezone()
            )
        else:
            last_modified_node_path = max(
                project_path.rglob("#*"),
                key=lambda n: n.stat().st_mtime,
                default=None,
            )
            last_modified_ts = (
                datetime.fromtimestamp(
                    last_modified_node_path.stat().st_mtime
                ).astimezone()
                if last_modified_node_path is not None
                else project_created_at
            )
        return Project(
            name=project_path.name,
            nodes_number=max_node_number,
            created_at=project_created_at,
            last_modified_at=last_modified_ts,
        )

    def list(self) -> Sequence[Project]:
        settings = get_settings()
        base_path = self._resolve_base_projects_path(
            settings.project, settings.user_storage
        )
        return [
            self._get_project_info(p)
            for p in filter(Path.is_dir, base_path.iterdir())
        ]
