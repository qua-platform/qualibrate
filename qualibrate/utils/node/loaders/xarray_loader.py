from importlib.util import find_spec
from pathlib import Path
from typing import Any

from qualibrate.utils.node.loaders import BaseLoader


class XarrayLoader(BaseLoader):
    file_extensions: tuple[str, ...] = (".h5",)

    def load(self, file_path: Path, **kwargs: Any) -> Any:
        if find_spec("xarray") is None:
            return None
        from xarray import open_dataset

        return open_dataset(file_path)
