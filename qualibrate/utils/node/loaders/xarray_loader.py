from importlib.util import find_spec
from pathlib import Path
from typing import Any

from qualibrate.utils.node.loaders import BaseLoader


class XarrayLoader(BaseLoader):
    """
    Loader for xarray datasets.

    Attributes:
        file_extensions: A tuple of supported file extensions (e.g., ".h5").
    """

    file_extensions: tuple[str, ...] = (".h5",)

    def load(self, file_path: Path, **kwargs: Any) -> Any:
        """
        Loads a xarray dataset from a file.

        Args:
            file_path: The path to the xarray file.
            **kwargs: Additional arguments for file loading.

        Returns:
            The loaded xarray dataset, or None if the xarray library is
            unavailable.
        """
        if find_spec("xarray") is None:
            return None
        from xarray import open_dataset

        return open_dataset(file_path)
