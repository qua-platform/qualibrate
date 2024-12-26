import logging
import sys
from collections.abc import Mapping
from logging.handlers import RotatingFileHandler
from pathlib import Path
from types import TracebackType
from typing import Any, Literal, Optional, Union, get_args

from pythonjsonlogger.json import JsonFormatter
from qualibrate_config.resolvers import (
    get_qualibrate_config,
    get_qualibrate_config_path,
)

_SysExcInfoType = Union[
    tuple[type[BaseException], BaseException, Optional[TracebackType]],
    tuple[None, None, None],
]
_ExcInfoType = Optional[Union[bool, _SysExcInfoType, BaseException]]
_ArgsType = Union[tuple[object, ...], Mapping[str, object]]
LOG_LEVEL_NAMES_TYPE = Literal[
    "debug", "info", "warning", "error", "exception", "critical", "fatal"
]
ALLOWED_LOG_LEVEL_NAMES: tuple[LOG_LEVEL_NAMES_TYPE, ...] = get_args(
    LOG_LEVEL_NAMES_TYPE
)


__all__ = [
    "logger",
    "_SysExcInfoType",
    "_ExcInfoType",
    "LOG_LEVEL_NAMES_TYPE",
    "ALLOWED_LOG_LEVEL_NAMES",
]

LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"


class QualibrateFormatter(logging.Formatter):
    formatter = logging.Formatter(LOG_FORMAT)

    def __init__(
        self, *args: Any, default_msec_format: str = "%s.%03d", **kwargs: Any
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


class UserLogFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        return record.module == "qualibration_node" and record.funcName == "log"


class NonUserLogFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        return record.module != "qualibration_node" or record.funcName != "log"


class LazyInitLogger(logging.Logger):
    def __init__(self, name: str, level: Union[int, str] = 0) -> None:
        super().__init__(name, level or logging.DEBUG)

        console_stderr = logging.StreamHandler(sys.stderr)
        console_stderr.addFilter(NonUserLogFilter())
        console_stderr.setLevel(logging.INFO)
        console_stderr.setFormatter(ConsoleFormatter())

        console_stdout = logging.StreamHandler(sys.stdout)
        console_stdout.addFilter(UserLogFilter())
        console_stdout.setLevel(logging.INFO)
        console_stdout.setFormatter(ConsoleFormatter())
        self.addHandler(console_stderr)
        self.addHandler(console_stdout)

        self._initialized = False

    def _log(
        self,
        level: int,
        msg: object,
        args: _ArgsType,
        exc_info: Optional[_ExcInfoType] = None,
        extra: Optional[Mapping[str, object]] = None,
        stack_info: bool = False,
        stacklevel: int = 1,
    ) -> None:
        if not self._initialized:
            self._initialize()
        super()._log(level, msg, args, exc_info, extra, stack_info)

    @staticmethod
    def get_log_filepath() -> Path:
        q_config_path = get_qualibrate_config_path()
        qs = get_qualibrate_config(q_config_path)
        log_folder = qs.log_folder
        if log_folder is None:
            log_folder = Path().home().joinpath(".qualibrate", "logs")
        log_folder.mkdir(parents=True, exist_ok=True)
        log_file_path = log_folder / "qualibrate.log"
        return log_file_path

    def _initialize(self) -> None:
        file_handler = RotatingFileHandler(
            self.get_log_filepath(),
            maxBytes=1024 * 1024 * 10,  # 10 Mb
            backupCount=3,
        )
        file_handler.setLevel(logging.DEBUG)
        file_handler.setFormatter(QualibrateJsonFormatter())
        self.addHandler(file_handler)

        qm_logger = logging.getLogger("qm")
        # qm_logger.setLevel(logging.NOTSET)  # Set log level for dependency
        qm_logger.addHandler(file_handler)
        qm_logger.propagate = False

        self._initialized = True


_manager = logging.Logger.manager
_default_logger_class = _manager.loggerClass
# Temporary replace default logger class with our lazy init
_manager.setLoggerClass(LazyInitLogger)
logger = logging.getLogger("qualibrate")
if _default_logger_class is not None:
    _manager.setLoggerClass(_default_logger_class)
else:
    _manager.loggerClass = None
