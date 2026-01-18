from importlib.util import find_spec
from pathlib import Path
from typing import Any

from qualibrate.utils.node.loaders import BaseLoader


class ImageLoader(BaseLoader):
    """
    Loader for image files.

    Attributes:
        file_extensions: A tuple of supported image file extensions
            (e.g., ".png").
    """

    file_extensions: tuple[str, ...] = (".png",)

    def load(self, path: Path, **kwargs: Any) -> Any:
        """
        Loads an image file using the PIL library.

        Args:
            path: The path to the image file.
            **kwargs: Additional arguments for file loading.

        Returns:
            An opened image object, or None if the PIL library is not available.
        """
        if find_spec("PIL") is None:
            return None
        from PIL import Image

        self.__class__.validate_file_exists(path)
        return Image.open(path)
