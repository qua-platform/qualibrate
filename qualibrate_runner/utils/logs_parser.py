import json
from collections.abc import Mapping
from datetime import datetime
from typing import Any

__all__ = ["parse_log_line", "filter_log_date"]


def parse_log_line(line: str) -> dict[str, Any]:
    data = dict(json.loads(line))
    if "asctime" in data:
        data["asctime"] = datetime.fromisoformat(data["asctime"])
    return data


def filter_log_date(log_line: Mapping[str, Any], after: datetime) -> bool:
    if "asctime" not in log_line or not isinstance(
        log_line["asctime"], datetime
    ):
        return False
    return log_line["asctime"] >= after
