"""Sorting utilities for snapshot data.

This module provides helper functions for generating sort keys
for snapshot sorting operations.
"""

from typing import Any

from qualibrate.app.api.core.models.snapshot import SimplifiedSnapshotWithMetadata
from qualibrate.app.api.core.types import STATUS_SORT_PRIORITY, SortField

__all__ = ["get_sort_key"]


def get_sort_key(
    snapshot: SimplifiedSnapshotWithMetadata,
    sort_field: SortField,
    descending: bool = True,
) -> tuple[int, Any]:
    """Get sort key for a snapshot based on the sort field.

    Returns a tuple of (priority, value) for stable sorting.
    Priority ensures None values are sorted last regardless of sort direction.

    Args:
        snapshot: The snapshot to generate a sort key for.
        sort_field: The field to sort by (name, date, or status).
        descending: Sort direction (True = newest/highest first).

    Returns:
        Tuple of (priority, value) where priority ensures stable ordering
        and value is the actual sort value.

    Examples:
        >>> key = get_sort_key(snapshot, SortField.name, descending=False)
        >>> # Returns (0, "calibration_a") for a named snapshot
        >>> # Returns (1, "") for a snapshot with no name
    """
    if sort_field == SortField.name:
        name = snapshot.metadata.name if snapshot.metadata else None
        # Use empty string for None to sort nulls last
        return (0 if name else 1, (name or "").lower())
    elif sort_field == SortField.date:
        # Use created_at for date sorting
        return (0 if snapshot.created_at else 1, snapshot.created_at)
    elif sort_field == SortField.status:
        status = snapshot.metadata.status if snapshot.metadata else None
        priority = STATUS_SORT_PRIORITY.get(status, len(STATUS_SORT_PRIORITY))
        return (priority, status or "")
    # Default: sort by id
    return (0, snapshot.id)
