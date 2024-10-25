import logging
from collections.abc import Mapping
from logging.handlers import RotatingFileHandler
from pathlib import Path
from types import TracebackType
from typing import Optional, Union

try:
    from qualibrate_app.config import get_config_path, get_settings
except ImportError:
    get_config_path = None
    get_settings = None

_SysExcInfoType = Union[
    tuple[type[BaseException], BaseException, Optional[TracebackType]],
    tuple[None, None, None],
]
_ExcInfoType = Optional[Union[bool, _SysExcInfoType, BaseException]]
_ArgsType = Union[tuple[object, ...], Mapping[str, object]]

__all__ = ["logger"]

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


class LazyInitLogger(logging.Logger):
    _initialized = False

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
        log_folder = None
        if get_config_path is not None and get_settings is not None:
            try:
                config_path = get_config_path()
                settings = get_settings(config_path)
                log_folder = settings.qualibrate.log_folder
            except AttributeError:
                log_folder = None
        if log_folder is None:
            log_folder = Path().home().joinpath(".qualibrate", "logs")
        log_folder.mkdir(parents=True, exist_ok=True)
        log_file_path = log_folder / "qualibrate.log"
        return log_file_path

    def _initialize(self) -> None:
        self.setLevel(logging.DEBUG)
        file_handler = RotatingFileHandler(
            self.get_log_filepath(),
            maxBytes=1024 * 1024 * 10,  # 10 Mb
            backupCount=3,
        )
        file_handler.setLevel(logging.DEBUG)
        file_handler.setFormatter(QualibrateFormatter())
        self.addHandler(file_handler)

        console = logging.StreamHandler()
        console.setLevel(logging.INFO)
        console.setFormatter(ConsoleFormatter())
        self.addHandler(console)
        self._initialized = True


logger = LazyInitLogger("qualibrate-core")
