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
        return extension in cls.file_extensions

    @abstractmethod
    def load(self, file_path: Path, **kwargs: Any) -> Any:
        """
        Abstract method to load a file.

        Args:
            file_path: The path to the file to load.
            **kwargs: Additional arguments for file loading.

        Returns:
            The loaded content.

        Raises:
            NotImplementedError: If the method is not implemented in a subclass.
        """
        raise NotImplementedError
