import json
from enum import IntEnum
from base64 import b64encode
from typing import Mapping, Any, Optional
from pathlib import Path

from qualibrate.config import get_settings


__all__ = ["StorageJsonDb", "StorageLoadType"]


class StorageLoadType(IntEnum):
    Empty = 0
    Full = 1


class StorageJsonDb:
    data_file_name = "data.json"

    def __init__(self, path: Path):
        if not path.is_dir():
            rel_path = path.relative_to(get_settings().user_storage)
            raise FileNotFoundError(f"{rel_path} does not exist.")
        self._path = path
        self._load_type = StorageLoadType.Empty
        self._data: Optional[Mapping[str, Any]] = None

    @property
    def path(self) -> Path:
        return self._path.relative_to(get_settings().user_storage)

    @property
    def data(self) -> Optional[Mapping[str, Any]]:
        return self._data

    @property
    def load_type(self) -> StorageLoadType:
        return self._load_type

    def load(self, load_type: StorageLoadType) -> None:
        if self.load_type >= load_type:
            return
        if load_type != StorageLoadType.Full:
            return
        self._parse_data()

    def exists(self) -> bool:
        return self._path.exists()

    def list_elements(self) -> list[str]:  # iterdir isn't recursive
        return list(path.name for path in self._path.iterdir())

    def list_typed_elements(self, pattern: str) -> list[str]:
        return list(path.name for path in self._path.glob(pattern))

    def _parse_data(self) -> None:
        data_file = self._path / self.__class__.data_file_name
        if not data_file.is_file():
            return None
        with data_file.open("r") as file:
            content = json.load(file)
        if not isinstance(content, Mapping):
            raise ValueError("Unexpected data format.")
        content = dict(content)
        for key, value in content.items():
            if isinstance(value, str) and Path(value).suffix == ".png":
                img_path = (self._path / value).resolve()
                if (
                    not img_path.is_relative_to(self._path)
                    or not img_path.is_file()
                ):
                    continue
                img_data = img_path.read_bytes()
                content[key] = f"base64;{b64encode(img_data).decode('utf-8')}"
        self._data = content
        self._load_type = StorageLoadType.Full
