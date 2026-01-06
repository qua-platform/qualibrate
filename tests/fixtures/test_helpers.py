"""
Test helpers for qualibrate-runner tests.

Minimal implementations extracted from qualibration-libs to avoid dependency.
"""

import time
from collections.abc import Iterator, Sequence
from typing import Any


def format_available_items(
    items: Sequence[Any] | dict[Any, Any],
    max_items: int = 10,
    item_type: str = "keys",
) -> str:
    """Format a list of available items for error messages."""
    item_keys = list(items.keys()) if isinstance(items, dict) else list(items)
    if item_keys:
        items_str = "'" + "', '".join(
            str(item) for item in item_keys[:max_items]
        )
        items_str += "', ..." if len(item_keys) > max_items else "'."
    else:
        items_str = "None."

    return f"Available {item_type}: {items_str}"


class XarrayDataFetcher:
    """
    Minimal XarrayDataFetcher for testing error handling.

    Simplified version that provides just enough functionality to test
    deep error handling when KeyError is raised from __getitem__.
    """

    def __init__(
        self,
        job: Any,
        axes: dict[str, Any] | None = None,
    ):
        """Initialize with job and axes."""
        self.job = job
        self.axes = axes
        self.t_start: float | None = None
        self.data: dict[str, Any] = {"dataset": None}

    def __getitem__(self, key: str) -> Any:
        """Get item from data dict, raising KeyError with helpful message."""
        try:
            return self.data[key]
        except KeyError as e:
            keys_list = format_available_items(self.data, item_type="keys")
            raise KeyError(
                f"Data key '{key}' not found in XarrayDataFetcher. {keys_list}"
            ) from e

    def __iter__(self) -> Iterator[Any]:
        """Make iterable - yields once for testing."""
        if self.t_start is None:
            self.t_start = time.time()
        yield self.data["dataset"]
