import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path

try:
    from qualibrate_app.config import get_config_path, get_settings

    config_path = get_config_path()
    settings = get_settings(config_path)
    log_folder = settings.qualibrate.log_folder
except (ModuleNotFoundError, AttributeError):
    log_folder = None


__all__ = ["logger"]

if log_folder is None:
    log_folder = Path().home().joinpath(".qualibrate", "logs")
log_folder.mkdir(parents=True, exist_ok=True)
log_file_path = log_folder / "qualibrate.log"
LOG_FORMAT = (
    "%(asctime)s - %(name)s - %(levelname)s - %(message)s "
    "(%(filename)s:%(lineno)d)"
)


class QualibrateFormatter(logging.Formatter):
    formatter = logging.Formatter(LOG_FORMAT)

    def format(self, record: logging.LogRecord) -> str:
        return self.formatter.format(record)


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


logger = logging.getLogger("qualibrate-core")
logger.setLevel(logging.DEBUG)
file_handler = RotatingFileHandler(
    log_file_path,
    maxBytes=1024 * 1024 * 10,  # 10 Mb
    backupCount=3,
)
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(QualibrateFormatter())
logger.addHandler(file_handler)

console = logging.StreamHandler()
console.setLevel(logging.INFO)
console.setFormatter(ConsoleFormatter())
logger.addHandler(console)
