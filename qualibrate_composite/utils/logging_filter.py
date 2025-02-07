import logging
from typing import cast


class EndpointFilter(logging.Filter):
    """Filter class to exclude specific endpoints from log entries."""

    def __init__(
        self, name: str = "", *, excluded_endpoints: list[str]
    ) -> None:
        """
        Initialize the EndpointFilter class.

        Args:
            excluded_endpoints: A list of endpoints to be excluded from log
                entries.
        """
        super().__init__(name)
        self.excluded_endpoint_starts = excluded_endpoints

    def filter(self, record: logging.LogRecord) -> bool:
        """
        Filter out log entries for excluded endpoints.

        Args:
            record: The log record to be filtered.

        Returns:
            bool: True if the log entry should be included, False otherwise.
        """
        if not record.args:
            return True
        if len(record.args) < 3:
            return True
        return any(
            map(
                lambda x: cast(
                    str, cast(tuple[object, ...], record.args)[2]
                ).startswith(x),
                self.excluded_endpoint_starts,
            )
        )
