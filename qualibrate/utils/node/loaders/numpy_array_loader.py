from pathlib import Path
from typing import Any, Union

import numpy as np
from numpy.lib.npyio import NpzFile

from qualibrate.utils.node.loaders.base_loader import BaseLoader


class NumpyArrayLoader(BaseLoader):
    file_extensions = (".npy", ".npz")

    def __init__(self) -> None:
        self.filepath_to_array: dict[
            Path, Union[np.ndarray[Any, np.dtype[Any]], NpzFile]
        ] = {}

    def load(self, file_path: Path, **kwargs: Any) -> Any:
        if file_path in self.filepath_to_array:
            file_content = self.filepath_to_array[file_path]
        else:
            file_content = np.load(file_path)
            self.filepath_to_array[file_path] = file_content
        subref = kwargs.get("subref")
        if subref is None:
            return file_content
        if not isinstance(file_content, NpzFile):
            raise ValueError(
                f"Loaded file {file_path} is not representation of "
                f"multiple NumPy arrays"
            )
        if subref in file_content:
            return file_content[subref]
        return None
