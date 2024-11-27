import json
from pathlib import Path
from typing import Any

from qualibrate.utils.node.loaders.base_loader import BaseLoader


class JSONLoader(BaseLoader):
    file_extensions = (".json",)

    def load(self, file_path: Path, **kwargs: Any) -> Any:
        with open(file_path) as f:
            return json.load(f)
