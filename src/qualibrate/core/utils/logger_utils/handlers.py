import json
import logging
from collections import deque
from datetime import datetime
from typing import Any

from qualibrate.utils.logger_utils.filters import filter_log_date

__all__ = ["InMemoryLogHandler"]


class InMemoryLogHandler(logging.Handler):
    default_asctime_log_format = "%Y-%m-%d %H:%M:%S,%f"

    def __init__(self, max_logs: int = 10_000):
        super().__init__()
        self.logs: deque[dict[str, Any]] = deque(
            maxlen=max_logs
        )  # Automatically rotates

    def emit(self, record: logging.LogRecord) -> None:
        try:
            msg = self.format(record)
            parsed = json.loads(msg)
            if asctime := parsed.get("asctime"):
                parsed["asctime"] = datetime.strptime(
                    asctime, self.__class__.default_asctime_log_format
                )
            self.logs.append(parsed)
        except Exception:
            self.handleError(record)

    def get_logs(
        self,
        after: datetime | None = None,
        before: datetime | None = None,
        num_entries: int = 100,
    ) -> list[dict[str, Any]]:
        filtered_logs = [
            log for log in reversed(self.logs) if filter_log_date(log)
        ]
        return list(reversed(filtered_logs[:num_entries]))
