import json
from base64 import b64encode
from collections.abc import Callable, Mapping
from enum import IntEnum
from pathlib import Path
from typing import Any

from qualibrate_config.models import QualibrateConfig

from qualibrate_app.api.core.domain.bases.i_dump import IDump
from qualibrate_app.api.core.domain.bases.load_type_flag import LoadTypeFlag
from qualibrate_app.api.core.models.storage import Storage as StorageModel
from qualibrate_app.api.exceptions.classes.storage import QFileNotFoundException
from qualibrate_app.api.exceptions.classes.values import QValueException

__all__ = [
    "DataFileStorage",
    "StorageLoadType",
    "StorageLoadTypeFlag",
    "StorageLoadTypeToLoadTypeFlag",
]


class StorageLoadType(IntEnum):
    Empty = 0
    Full = 1


class StorageLoadTypeFlag(LoadTypeFlag):
    Empty = 0
    DataFileWithoutRefs = 2**0
    DataFileWithImgs = DataFileWithoutRefs | 2**1

    Full = 2**5 | DataFileWithImgs | Empty

    def is_set(self, field: "StorageLoadTypeFlag") -> bool:
        return self._is_set(field)


StorageLoadTypeToLoadTypeFlag = {
    StorageLoadType.Empty: StorageLoadTypeFlag.Empty,
    StorageLoadType.Full: StorageLoadTypeFlag.Full,
}


def load_data_png_images_parse(
    content: dict[str, Any], node_path: Path
) -> dict[str, Any]:
    for key, value in content.items():
        if isinstance(value, str) and Path(value).suffix == ".png":
            img_path = (node_path / value).resolve()
            if not img_path.is_relative_to(node_path) or not img_path.is_file():
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
            content[key] = load_data_png_images_parse(value, node_path)
    return content


LOAD_STORAGE_FLAG_FUNC_TYPE = Callable[[dict[str, Any], Path], dict[str, Any]]
LOADERS: dict[StorageLoadTypeFlag, LOAD_STORAGE_FLAG_FUNC_TYPE] = {
    StorageLoadTypeFlag.DataFileWithImgs: load_data_png_images_parse,
}


def _storage_loader_from_flag(
    snapshot_path: Path,
    data_file: Path,
    load_type: StorageLoadTypeFlag,
    content: dict[str, Any] | None = None,
) -> dict[str, Any] | None:
    if content is None:
        content = {}
    if load_type == StorageLoadTypeFlag.Empty:
        return content

    if not data_file.is_file():
        return None
    with data_file.open("r") as file:
        try:
            new_content = json.load(file)
            if not isinstance(new_content, Mapping):
                raise QValueException("Unexpected data format.")
            content.update(new_content)
        except json.JSONDecodeError as ex:
            raise QValueException("Unexpected data format.") from ex
    if load_type == StorageLoadTypeFlag.DataFileWithoutRefs:
        return content
    for lt in StorageLoadTypeFlag.__members__.values():
        if (
            load_type.is_set(lt)
            and lt <= load_type
            and (loader := LOADERS.get(lt))
        ):
            loader(content, snapshot_path)
    return content


class DataFileStorage(IDump):
    possible_filenames = ["data.json", "results.json"]

    def __init__(self, path: Path, settings: QualibrateConfig):
        if not path.is_dir():
            rel_path = path.relative_to(settings.storage.location)
            raise QFileNotFoundException(f"{rel_path} does not exist.")
        self._path = path
        self._load_type_flag = StorageLoadTypeFlag.Empty
        self._data: dict[str, Any] | None = None
        self._settings = settings

    @property
    def path(self) -> Path:
        return self._path.relative_to(self._settings.storage.location)

    @property
    def data(self) -> Mapping[str, Any] | None:
        return self._data

    @property
    def load_type_flag(self) -> StorageLoadTypeFlag:
        return self._load_type_flag

    def _get_filename(self) -> Path | None:
        for filename in self.__class__.possible_filenames:
            filepath = self._path / filename
            if filepath.is_file():
                return filepath
        return None

    def load_from_flag(self, load_type_flag: StorageLoadTypeFlag) -> None:
        if self.load_type_flag.is_set(load_type_flag):
            return
        data_file = self._get_filename()
        if data_file is None:
            return
        self._data = _storage_loader_from_flag(
            self._path, data_file, load_type_flag, self._data
        )
        self._load_type_flag |= load_type_flag

    def exists(self) -> bool:
        return self._path.exists()

    def list_elements(self) -> list[str]:  # iterdir isn't recursive
        return list(path.name for path in self._path.iterdir())

    def list_typed_elements(self, pattern: str) -> list[str]:
        return list(path.name for path in self._path.glob(pattern))

    def dump(self) -> StorageModel:
        return StorageModel(path=self.path, data=self.data)

    def __repr__(self) -> str:
        return (
            f"{self.__class__.__name__}"
            f"(path={self.path!r}, load_type={self.load_type_flag!r})"
        )
