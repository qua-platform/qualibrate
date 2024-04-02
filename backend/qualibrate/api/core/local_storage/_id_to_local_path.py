from pathlib import Path
from typing import Callable, Optional

from qualibrate.api.core.types import IdType
from qualibrate.api.core.utils.singleton import Singleton
from qualibrate.api.exceptions.classes.storage import QFileNotFoundException

__all__ = ["default_node_path_solver", "IdToLocalPath", "NodePathSolverType"]


NodePathSolverType = Callable[[IdType, Path], Optional[Path]]


def default_node_path_solver(id: IdType, base_path: Path) -> Optional[Path]:
    return next(base_path.rglob(f"#{id}_*"), None)


class IdToLocalPath(metaclass=Singleton):
    def __init__(self, base_path: Path):
        self._mapping: dict[IdType, Path] = {}
        self._base_path = base_path

    def __getitem__(self, id: IdType) -> Path:
        path = self.get(id)
        if path is None:
            raise QFileNotFoundException(f"Node {id} not found")
        return path

    def get(
        self,
        id: IdType,
        solver: NodePathSolverType = default_node_path_solver,
    ) -> Optional[Path]:
        if id in self._mapping:
            return self._mapping[id]
        path = solver(id, self._base_path)
        if path is None:
            return None
        self._mapping[id] = path
        return path
