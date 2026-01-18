import logging
import sys
from collections.abc import Mapping
from logging.handlers import RotatingFileHandler
from pathlib import Path
from types import TracebackType
from typing import Literal, get_args

from qualibrate_config.resolvers import (
    get_qualibrate_config,
    get_qualibrate_config_path,
)

from qualibrate.utils.logger_utils.filters import (
    NonUserLogFilter,
    UserLogFilter,
)
from qualibrate.utils.logger_utils.fotmatters import (
    ConsoleFormatter,
    QualibrateJsonFormatter,
)
from qualibrate.utils.logger_utils.handlers import InMemoryLogHandler

_SysExcInfoType = (
    tuple[type[BaseException], BaseException, TracebackType | None]
    | tuple[None, None, None]
)

_ExcInfoType = bool | _SysExcInfoType | BaseException | None
_ArgsType = tuple[object, ...] | Mapping[str, object]
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


class LazyInitLogger(logging.Logger):
    def __init__(self, name: str, level: int | str = 0) -> None:
        super().__init__(name, level or logging.DEBUG)
        self.in_memory_handler = InMemoryLogHandler()
        self.in_memory_handler.setFormatter(QualibrateJsonFormatter())

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
        self.addHandler(self.in_memory_handler)

        self._initialized = False

    def _log(
        self,
        level: int,
        msg: object,
        args: _ArgsType,
        exc_info: _ExcInfoType | None = None,
        extra: Mapping[str, object] | None = None,
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
