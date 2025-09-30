from pathlib import Path
from typing import Any

import numpy as np
from numpy.lib.npyio import NpzFile

from qualibrate.utils.node.loaders.base_loader import BaseLoader


class NumpyArrayLoader(BaseLoader):
    """
    Loader for NumPy array files.

    Attributes:
        file_extensions: A tuple of supported file extensions
            (e.g., ".npy", ".npz").
        filepath_to_array: A cache mapping file paths to loaded NumPy arrays.
    """

    file_extensions = (".npy", ".npz")

    def __init__(self) -> None:
        self.filepath_to_array: dict[
            Path, np.ndarray[Any, np.dtype[Any]] | NpzFile
        ] = {}

    def load(self, path: Path, **kwargs: Any) -> Any:
        """
        Loads a NumPy array file and resolves subreferences if applicable.

        Args:
            path: The path to the NumPy file.
            **kwargs: Additional arguments, including "subref" for subreference
                keys.

        Returns:
            The loaded NumPy array or the specified subreference content.

        Raises:
            ValueError: If the file is not an `NpzFile` but a subreference is
                requested.
        """
        if path in self.filepath_to_array:
            file_content = self.filepath_to_array[path]
        else:
            self.__class__.validate_file_exists(path)
            file_content = np.load(path)
            self.filepath_to_array[path] = file_content
        subref = kwargs.get("subref")
        if subref is None:
            return file_content
        if not isinstance(file_content, NpzFile):
            raise ValueError(
                f"Loaded file {path} is not representation of "
                f"multiple NumPy arrays"
            )
        return file_content.get(subref)
