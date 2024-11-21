from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any


class BaseLoader(ABC):
    file_extensions: tuple[str, ...]

    @classmethod
    def is_loader_support_extension(cls, extension: str) -> bool:
        return extension in cls.file_extensions

    @abstractmethod
    def load(self, file_path: Path, **kwargs: Any) -> Any:
        raise NotImplementedError
