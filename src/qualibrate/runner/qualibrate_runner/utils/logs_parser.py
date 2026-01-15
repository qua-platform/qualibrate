import json
import logging
from collections.abc import Generator
from datetime import datetime
from functools import partial
from itertools import islice
from pathlib import Path
from typing import Any, TextIO, cast

from qualibrate.utils.logger_m import LazyInitLogger, logger
from qualibrate.utils.logger_utils.filters import filter_log_date
from qualibrate_config.models import QualibrateConfig

__all__ = [
    "parse_log_line",
    "parse_log_line_with_previous",
    "get_logs_from_qualibrate_files",
    "get_logs_from_qualibrate_in_memory_storage",
]

default_asctime_log_format = "%Y-%m-%d %H:%M:%S,%f"


def parse_log_line(
    line: str, previous_msg: dict[str, Any] | None = None
) -> dict[str, Any]:
    # JSON format
    if line.startswith("{"):
        try:
            data = dict(json.loads(line))
        except json.decoder.JSONDecodeError as ex:
            logging.exception(f"Can't parse line {line}", exc_info=ex)
            return {}
        if "asctime" in data:
            data["asctime"] = datetime.strptime(
                data["asctime"], default_asctime_log_format
            )
        return data
    # old default-string-format
    parts = line.split(" - ", maxsplit=3)
    if len(parts) == 4:
        return {
            "asctime": datetime.strptime(parts[0], default_asctime_log_format),
            "name": parts[1],
            "levelname": parts[2],
            "message": parts[3].rstrip(),
        }
    if previous_msg is None:
        return {"message": line.rstrip()}
    copied = previous_msg.copy()
    copied["message"] = line.rstrip()
    return copied


def parse_log_line_with_previous(
    file: TextIO,
) -> Generator[dict[str, Any], None, None]:
    previous = None
    for line in file:
        previous = parse_log_line(line, previous)
        try:
            yield previous
        except TypeError as e:
            logging.exception(line, exc_info=e)


def get_logs_from_qualibrate_files(
    after: datetime | None = None,
    before: datetime | None = None,
    num_entries: int = 100,
    *,
    config: QualibrateConfig,
) -> list[dict[str, Any]]:
    log_folder = config.log_folder
    if log_folder is None:
        return []
    out_logs: list[dict[str, Any]] = []
    q_log_files = filter(Path.is_file, log_folder.glob("qualibrate.log*"))
    filter_log_date_range = partial(filter_log_date, after=after, before=before)
    for log_file in sorted(q_log_files):
        with open(log_file) as f:
            filtered = list(
                filter(filter_log_date_range, parse_log_line_with_previous(f))
            )
            lines_date_filtered = reversed(filtered)
            file_logs = islice(lines_date_filtered, num_entries - len(out_logs))
            out_logs.extend(file_logs)
            if len(out_logs) == num_entries:
                return list(reversed(out_logs))
    return list(reversed(out_logs))


def get_logs_from_qualibrate_in_memory_storage(
    after: datetime | None = None,
    before: datetime | None = None,
    num_entries: int = 100,
    *,
    config: QualibrateConfig,
) -> list[dict[str, Any]]:
    return cast(LazyInitLogger, logger).in_memory_handler.get_logs(
        after, before, num_entries
    )
