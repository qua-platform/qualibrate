import json
import logging
from collections.abc import Generator, Mapping
from datetime import datetime
from sys import version_info
from typing import Any, Optional, TextIO

if version_info >= (3, 10):
    from types import NoneType  # type: ignore[attr-defined]
else:
    NoneType = type(None)

__all__ = ["parse_log_line", "filter_log_date", "parse_log_line_with_previous"]

default_asctime_log_format = "%Y-%m-%d %H:%M:%S,%f"


def parse_log_line(
    line: str, previous_msg: Optional[dict[str, Any]] = None
) -> dict[str, Any]:
    # JSON format
    if line.startswith("{"):
        try:
            data = dict(json.loads(line))
        except json.decoder.JSONDecodeError as ex:
            logging.exception(f"Can't parse line {line}", exc_info=ex)
            return {}
        if "asctime" in data:
            data["asctime"] = datetime.fromisoformat(data["asctime"])
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
) -> Generator[dict[str, Any], None, NoneType]:
    previous = None
    for line in file:
        previous = parse_log_line(line, previous)
        try:
            yield previous
        except TypeError as e:
            logging.exception(line, exc_info=e)
    return None


def filter_log_date(
    log_line: Mapping[str, Any],
    after: Optional[datetime] = None,
    before: Optional[datetime] = None,
) -> bool:
    if "asctime" not in log_line or not isinstance(
        log_line["asctime"], datetime
    ):
        return False
    if after is None and before is None:
        return True
    if after is not None and before is not None:
        return after <= log_line["asctime"] < before
    if after is not None:
        return after <= log_line["asctime"]
    return log_line["asctime"] < before  # type: ignore[operator]
