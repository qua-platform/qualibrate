import json
import logging
from collections import deque
from collections.abc import Callable
from datetime import datetime
from typing import Any

from qualibrate.core.utils.logger_utils.filters import filter_log_date

__all__ = ["InMemoryLogHandler"]


class InMemoryLogHandler(logging.Handler):
    default_asctime_log_format = "%Y-%m-%d %H:%M:%S,%f"

    def __init__(self, max_logs: int = 10_000):
        super().__init__()
        self.logs: deque[dict[str, Any]] = deque(maxlen=max_logs)  # Automatically rotates
        self._broadcast_callback: Callable[[dict[str, Any]], None] | None = None

    def set_broadcast_callback(self, callback: Callable[[dict[str, Any]], None] | None) -> None:
        """Set a callback function to be called when a log entry is emitted.

        The callback receives the parsed log entry dict and can be used
        to broadcast logs via WebSocket in real-time.
        """
        self._broadcast_callback = callback

    def emit(self, record: logging.LogRecord) -> None:
        try:
            msg = self.format(record)
            parsed = json.loads(msg)
            if asctime := parsed.get("asctime"):
                parsed["asctime"] = datetime.strptime(asctime, self.__class__.default_asctime_log_format)
            self.logs.append(parsed)
            if self._broadcast_callback is not None:
                self._broadcast_callback(parsed)
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
