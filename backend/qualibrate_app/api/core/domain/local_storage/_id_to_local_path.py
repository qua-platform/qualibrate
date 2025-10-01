from collections.abc import Callable
from pathlib import Path

from qualibrate_app.api.core.types import IdType
from qualibrate_app.api.core.utils.path.node import NodePath
from qualibrate_app.api.core.utils.singleton import Singleton
from qualibrate_app.api.exceptions.classes.storage import QFileNotFoundException

__all__ = ["default_node_path_solver", "IdToLocalPath", "NodePathSolverType"]


NodePathSolverType = Callable[[IdType, Path], NodePath | None]


def default_node_path_solver(id: IdType, base_path: Path) -> NodePath | None:
    node_path = next(base_path.glob(f"*/#{id}_*"), None)
    return NodePath(node_path) if node_path is not None else None


class _IdToProjectLocalPath:
    def __init__(self, project_name: str, project_path: Path) -> None:
        self._mapping: dict[IdType, NodePath] = {}
        self._project_name = project_name
        self._project_path = project_path

    def get(
        self,
        id: IdType,
        solver: NodePathSolverType = default_node_path_solver,
    ) -> NodePath | None:
        if id in self._mapping:
            return self._mapping[id]
        path = solver(id, self._project_path)
        if path is None:
            return None
        self._mapping[id] = path
        return path


class IdToLocalPath(metaclass=Singleton):
    def __init__(self) -> None:
        self._project_to_path: dict[str, _IdToProjectLocalPath] = {}

    def get(
        self,
        project: str,
        id: IdType,
        project_path: Path,
        solver: NodePathSolverType = default_node_path_solver,
    ) -> NodePath | None:
        if project not in self._project_to_path:
            self._project_to_path[project] = _IdToProjectLocalPath(
                project, project_path
            )
        p2p = self._project_to_path[project]
        path = p2p.get(id, solver)
        return path

    def get_or_raise(
        self,
        project: str,
        id: IdType,
        project_path: Path,
        solver: NodePathSolverType = default_node_path_solver,
    ) -> NodePath:
        path = self.get(project, id, project_path, solver)
        if path is None:
            raise QFileNotFoundException(
                f"Node {id} of project '{project}' not found"
            )
        return path
