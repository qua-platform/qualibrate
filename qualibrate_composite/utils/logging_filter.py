import logging
from typing import cast


class EndpointFilter(logging.Filter):
    """Filter class to exclude specific endpoints from log entries."""

    def __init__(self, name: str = "", *, excluded_endpoints: list[str]) -> None:
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
        if len(record.args) < 5:
            return True

        # Get the endpoint path from the log record (expected to be the 3rd argument)
        log_args = cast(tuple[object, ...], record.args)
        endpoint_path = cast(str, log_args[2])
        response_status_code = cast(int, log_args[4])
        # Check if the endpoint path starts with any of the excluded patterns
        for excluded_pattern in self.excluded_endpoint_starts:
            if not endpoint_path.startswith(excluded_pattern):
                continue
            if response_status_code in [200, 204]:
                return False

        return True
