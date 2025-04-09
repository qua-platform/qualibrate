import json
from base64 import b64encode
from collections.abc import Mapping
from enum import IntEnum
from pathlib import Path
from typing import Any, Optional

from qualibrate_config.models import QualibrateConfig

from qualibrate_app.api.core.domain.bases.i_dump import IDump
from qualibrate_app.api.core.models.storage import Storage as StorageModel
from qualibrate_app.api.exceptions.classes.storage import QFileNotFoundException
from qualibrate_app.api.exceptions.classes.values import QValueException

__all__ = ["DataFileStorage", "StorageLoadType"]


class StorageLoadType(IntEnum):
    Empty = 0
    Full = 1


class DataFileStorage(IDump):
    data_file_name = "data.json"

    def __init__(self, path: Path, settings: QualibrateConfig):
        if not path.is_dir():
            rel_path = path.relative_to(settings.storage.location)
            raise QFileNotFoundException(f"{rel_path} does not exist.")
        self._path = path
        self._load_type = StorageLoadType.Empty
        self._data: Optional[Mapping[str, Any]] = None
        self._settings = settings

    @property
    def path(self) -> Path:
        return self._path.relative_to(self._settings.storage.location)

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

    def _recursively_parse_data(
        self, content: dict[str, Any]
    ) -> dict[str, Any]:
        for key, value in content.items():
            if isinstance(value, str) and Path(value).suffix == ".png":
                img_path = (self._path / value).resolve()
                if (
                    not img_path.is_relative_to(self._path)
                    or not img_path.is_file()
                ):
                    continue
                img_data = img_path.read_bytes()
                # TODO: dynamic compute MIME type
                content[key] = {
                    value: (
                        "data:image/png;base64,"
                        f"{b64encode(img_data).decode('utf-8')}"
                    )
                }
            if isinstance(value, dict):
                content[key] = self._recursively_parse_data(value)
        return content

    def _parse_data(self) -> None:
        data_file = self._path / self.__class__.data_file_name
        if not data_file.is_file():
            return None
        with data_file.open("r") as file:
            try:
                content = json.load(file)
            except json.JSONDecodeError as ex:
                raise QValueException("Unexpected data format.") from ex
        if not isinstance(content, Mapping):
            raise QValueException("Unexpected data format.")
        self._data = self._recursively_parse_data(dict(content))
        self._load_type = StorageLoadType.Full

    def dump(self) -> StorageModel:
        return StorageModel(path=self.path, data=self.data)
