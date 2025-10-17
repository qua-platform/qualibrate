from pathlib import Path

from qualibrate_app.api.core.domain.local_storage.utils.project_local_path_id import (  # noqa: E501
    IdToProjectLocalPath,
)
from qualibrate_app.api.core.types import IdType
from qualibrate_app.api.core.utils.path.node import NodePath
from qualibrate_app.api.core.utils.singleton import Singleton
from qualibrate_app.api.exceptions.classes.storage import QFileNotFoundException

__all__ = ["IdToLocalPath"]


class IdToLocalPath(metaclass=Singleton):
    def __init__(self) -> None:
        self._project_to_manager: dict[str, IdToProjectLocalPath] = {}

    def get_project_manager(
        self, project: str, project_path: Path
    ) -> IdToProjectLocalPath:
        if project not in self._project_to_manager:
            self._project_to_manager[project] = IdToProjectLocalPath(
                project, project_path
            )
        return self._project_to_manager[project]

    def get_path(
        self,
        project: str,
        id: IdType,
        project_path: Path,
    ) -> NodePath | None:
        return self.get_project_manager(project, project_path).get_path(id)

    def get_path_or_raise(
        self,
        project: str,
        id: IdType,
        project_path: Path,
    ) -> NodePath:
        path = self.get_path(project, id, project_path)
        if path is None:
            raise QFileNotFoundException(
                f"Node {id} of project '{project}' not found"
            )
        return path
