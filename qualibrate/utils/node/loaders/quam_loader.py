from pathlib import Path
from typing import Any

from qualibrate.utils.logger_m import logger
from qualibrate.utils.node.loaders.json_loader import JSONLoader

try:
    from quam.core import QuamRoot
except ModuleNotFoundError:
    QuamRoot = None


class QuamLoader(JSONLoader):
    """Loader for QUAM files, extending JSONLoader."""

    def load(self, path: Path, **kwargs: Any) -> Any:
        """
        Loads a QUAM file and attempts to parse it using `QuamRoot`.

        Args:
            path: The path to the QUAM file.
            **kwargs: Additional arguments for file loading.

        Returns:
            The parsed QUAM object, or the raw JSON content if parsing fails.
        """
        json_data = super().load(path, **kwargs)
        if QuamRoot is None:
            return json_data
        try:
            return QuamRoot.load(json_data)
        except Exception as ex:
            logger.exception(
                "QuamRoot wasn't successfully loaded from reference "
                f"{path}. Returning raw json",
                exc_info=ex,
            )
            return json_data
