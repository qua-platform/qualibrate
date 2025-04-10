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
        try:
            return QuamRoot.load(path)
        except Exception as ex:
            logger.exception(
                "QuamRoot wasn't successfully loaded from reference "
                f"{path}. Returning raw json",
                exc_info=ex,
            )
            if path.is_file():
                if self.__class__.is_loader_support_extension(path.suffix):
                    return super().load(path)
                logger.error(
                    f"Can't load file from reference {path}. Unsupported type."
                )
                return {}
            quam = {}
            for file in path.glob("*.json"):
                try:
                    quam.update(super().load(file))
                except ValueError as e:
                    logger.warning(
                        f"Can't parse quam file: {file.name}", exc_info=e
                    )
            return quam
