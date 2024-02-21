from pathlib import Path


__all__ = ["StorageJsonDb"]

from typing import Mapping

from qualibrate.config import get_settings


class StorageJsonDb:
    # TODO: is dir? or file? or any?
    def __init__(self, path: Path):
        if not path.exists():
            rel_path = path.relative_to(get_settings().user_storage)
            raise FileNotFoundError(f"{rel_path} does not exist.")
        self._path = path

    @property
    def path(self) -> Path:
        return self._path.relative_to(get_settings().user_storage)

    def exists(self) -> bool:
        return self._path.exists()

    def list_elements(self) -> list[str]:  # iterdir isn't recursive
        return list(path.name for path in self._path.iterdir())

    def list_typed_elements(self, pattern: str) -> list[str]:
        return list(path.name for path in self._path.glob(pattern))

    def get_images_content(self, pattern: str) -> Mapping[str, bytes]:
        return {
            file.name: file.read_bytes() for file in self._path.glob(pattern)
        }
