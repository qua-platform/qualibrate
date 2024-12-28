import json
from collections.abc import Mapping
from datetime import datetime
from typing import Any, Optional

__all__ = ["parse_log_line", "filter_log_date"]


def parse_log_line(line: str) -> dict[str, Any]:
    data = dict(json.loads(line))
    if "asctime" in data:
        data["asctime"] = datetime.fromisoformat(data["asctime"])
    return data


def filter_log_date(
    log_line: Mapping[str, Any],
    after: datetime,
    before: Optional[datetime] = None,
) -> bool:
    if "asctime" not in log_line or not isinstance(
        log_line["asctime"], datetime
    ):
        return False
    if before is None:
        return log_line["asctime"] >= after
    else:
        return after <= log_line["asctime"] < before
