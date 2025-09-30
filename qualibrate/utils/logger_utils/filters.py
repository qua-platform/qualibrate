import logging

__all__ = ["UserLogFilter", "NonUserLogFilter", "filter_log_date"]

from collections.abc import Mapping
from datetime import datetime
from typing import Any


def filter_log_date(
    log_line: Mapping[str, Any],
    after: datetime | None = None,
    before: datetime | None = None,
) -> bool:
    asctime = log_line["asctime"]
    if not isinstance(asctime, datetime):
        return False
    return (after is None or asctime >= after) and (
        before is None or asctime <= before
    )


class UserLogFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        return record.module == "qualibration_node" and record.funcName == "log"


class NonUserLogFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        return record.module != "qualibration_node" or record.funcName != "log"
