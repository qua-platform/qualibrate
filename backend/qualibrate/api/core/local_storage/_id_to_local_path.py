from pathlib import Path
from typing import Callable, Optional

from qualibrate.api.core.types import IdType
from qualibrate.api.core.utils.singleton import Singleton


__all__ = ["default_node_path_loader", "IdToLocalPath", "SolverType"]


SolverType = Callable[[IdType, Path], Optional[Path]]


def default_node_path_loader(id: IdType, base_path: Path) -> Optional[Path]:
    return next(base_path.rglob(f"#{id}_*"), None)


class IdToLocalPath(metaclass=Singleton):
    def __init__(self, base_path: Path):
        self._mapping: dict[IdType, Path] = {}
        self._base_path = base_path

    def __getitem__(self, id: IdType) -> Path:
        return self._mapping[id]

    def get(
        self, id: IdType, solver: SolverType = default_node_path_loader
    ) -> Optional[Path]:
        if id in self._mapping:
            return self._mapping[id]
        path = solver(id, self._base_path)
        if path is None:
            return None
        self._mapping[id] = path
        return path
