import logging
from typing import Any

from pythonjsonlogger.json import JsonFormatter

__all__ = [
    "LOG_FORMAT",
    "QualibrateFormatter",
    "QualibrateJsonFormatter",
    "ConsoleFormatter",
]

LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"


class QualibrateFormatter(logging.Formatter):
    formatter = logging.Formatter(LOG_FORMAT)

    def __init__(
        self, *args: Any, default_msec_format: str = "%s,%03d", **kwargs: Any
    ) -> None:
        super().__init__(*args, **kwargs)
        self.formatter.default_msec_format = default_msec_format

    def format(self, record: logging.LogRecord) -> str:
        return self.formatter.format(record)


class QualibrateJsonFormatter(QualibrateFormatter):
    formatter = JsonFormatter(LOG_FORMAT)


class ConsoleFormatter(QualibrateFormatter):
    grey = "\x1b[38;20m"
    yellow = "\x1b[33;20m"
    red = "\x1b[31;20m"
    bold_red = "\x1b[31;1m"
    reset = "\x1b[0m"

    FORMATS = {
        logging.DEBUG: grey + LOG_FORMAT + reset,
        logging.INFO: grey + LOG_FORMAT + reset,
        logging.WARNING: yellow + LOG_FORMAT + reset,
        logging.ERROR: red + LOG_FORMAT + reset,
        logging.CRITICAL: bold_red + LOG_FORMAT + reset,
    }
    FORMATTERS = {
        level: logging.Formatter(format) for level, format in FORMATS.items()
    }

    def format(self, record: logging.LogRecord) -> str:
        log_fmtr = self.FORMATTERS.get(record.levelno, self.formatter)
        return log_fmtr.format(record)
