from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any


class BaseLoader(ABC):
    """
    Abstract base class for file loaders.

    Attributes:
        file_extensions: A tuple of file extensions supported by the loader.
    """

    file_extensions: tuple[str, ...]

    @classmethod
    def is_loader_support_extension(cls, extension: str) -> bool:
        """
        Checks if the loader supports a specific file extension.

        Args:
            extension: The file extension to check.

        Returns:
            True if the extension is supported, False otherwise.
        """
        return extension.lower() in cls.file_extensions

    @classmethod
    def validate_file_exists(cls, file_path: Path) -> None:
        if not file_path.is_file():
            raise FileNotFoundError(
                f"Can't load file '{file_path}' by loader {cls.__name__}"
            )

    @abstractmethod
    def load(self, path: Path, **kwargs: Any) -> Any:
        """
        Abstract method to load a file.

        Args:
            path: The path to the file to load.
            **kwargs: Additional arguments for file loading.

        Returns:
            The loaded content.

        Raises:
            NotImplementedError: If the method is not implemented in a subclass.
        """
        raise NotImplementedError
