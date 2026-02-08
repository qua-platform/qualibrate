import string
from collections.abc import Mapping, Sequence
from datetime import date
from enum import Enum
from typing import Any

from pydantic import BaseModel

AllowedSearchKeys = string.ascii_letters + string.digits + "-_*"


class SortField(str, Enum):
    """Supported fields for sorting snapshots.

    - name: Sort alphabetically by snapshot name (case-insensitive)
    - date: Sort by creation timestamp (created_at)
    - status: Sort by execution status priority
    """

    name = "name"
    date = "date"
    status = "status"


# Priority order for status sorting (lower number = higher priority).
# Used when sorting with descending=False (ascending order).
# Snapshots with unknown/None status are sorted last.
STATUS_SORT_PRIORITY: dict[str | None, int] = {
    "finished": 0,
    "skipped": 1,
    "pending": 2,
    "running": 3,
    "error": 4,
    None: 5,
}

IdType = int
DocumentType = Mapping[str, Any]
DocumentSequenceType = Sequence[DocumentType]


class PageFilter(BaseModel):
    page: int = 1
    per_page: int = 50


class SearchFilter(BaseModel):
    name: str | None = None
    name_part: str | None = None
    min_node_id: IdType = 1
    max_node_id: int | None = None
    min_date: date | None = None
    max_date: date | None = None
    tags: list[str] | None = None  # Filter by tags (AND logic)


class SearchWithIdFilter(SearchFilter):
    id: IdType | None = None
