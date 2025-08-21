from collections.abc import Sequence
from datetime import datetime
from pathlib import Path

from qualibrate_app.api.core.domain.bases.project import ProjectsManagerBase
from qualibrate_app.api.core.models.project import Project
from qualibrate_app.api.core.utils.path.node import NodePath
from qualibrate_app.api.exceptions.classes.storage import QFileNotFoundException
from qualibrate_app.api.exceptions.classes.values import QValueException


class ProjectsManagerLocalStorage(ProjectsManagerBase):
    def _active_project_setter(self, value: str) -> None:
        self._set_user_storage_project(value)

    def _set_user_storage_project(self, project_name: str) -> None:
        new_project_path = self._resolve_new_project_path(
            project_name,
            self._settings.project,
            self._settings.storage.location,
        )
        if not new_project_path.is_dir():
            raise QFileNotFoundException(
                f"Project {project_name} does not exist"
            )
        super()._set_user_storage_project(project_name)

    def create(self, project_name: str) -> str:
        new_project_path = self._resolve_new_project_path(
            project_name,
            self._settings.project,
            self._settings.storage.location,
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
            map(NodePath, project_path.glob("*/#*")),
            key=lambda n: n.id or -1,
            default=None,
        )
        if max_node_number_path is not None:
            (
                max_node_num_id,
                _,
                max_node_number_time,
            ) = max_node_number_path.get_node_id_name_time()
        else:
            max_node_num_id = None
            max_node_number_time = None
        max_node_number = max_node_num_id or -1
        if (
            max_node_number_path is not None
            and max_node_number_time is not None
        ):
            last_modified_ts = max_node_number_path.datetime.replace(
                hour=max_node_number_time.hour,
                minute=max_node_number_time.minute,
                second=max_node_number_time.second,
            ).astimezone()
        else:
            last_modified_node_path = max(
                project_path.glob("*/#*"),
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
        base_path = self._resolve_base_projects_path(
            self._settings.project,
            self._settings.storage.location,
        )
        return [
            self._get_project_info(p)
            for p in filter(Path.is_dir, base_path.iterdir())
        ]
