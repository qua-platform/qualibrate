from pathlib import Path
from typing import Any

from qualibrate.utils.logger_m import logger
from qualibrate.utils.node.loaders.json_loader import JSONLoader

try:
    from quam.core import QuamRoot
except ModuleNotFoundError:
    QuamRoot = None


class QuamLoader(JSONLoader):
    def load(self, file_path: Path, **kwargs: Any) -> Any:
        json_data = super().load(file_path, **kwargs)
        if QuamRoot is None:
            return json_data
        try:
            return QuamRoot.load(json_data)
        except Exception as ex:
            logger.exception(
                "QuamRoot wasn't successfully loaded from reference "
                f"{file_path}. Returning raw json",
                exc_info=ex,
            )
            return json_data
