from importlib.util import find_spec
from pathlib import Path
from typing import Any

from qualibrate.utils.node.loaders import BaseLoader


class ImageLoader(BaseLoader):
    file_extensions: tuple[str, ...] = (".png",)

    def load(self, file_path: Path, **kwargs: Any) -> Any:
        if find_spec("PIL") is None:
            return None
        from PIL import Image

        return Image.open(file_path)
