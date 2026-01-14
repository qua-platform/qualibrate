import string
from collections.abc import Mapping, Sequence
from datetime import date
from typing import Any

from pydantic import BaseModel

AllowedSearchKeys = string.ascii_letters + string.digits + "-_*"

IdType = int
DocumentType = Mapping[str, Any]
DocumentSequenceType = Sequence[DocumentType]


class PageFilter(BaseModel):
    page: int = 1
    per_page: int = 50


class SearchFilter(BaseModel):
    name_part: str | None = None
    min_node_id: IdType = 1
    max_node_id: int | None = None
    min_date: date | None = None
    max_date: date | None = None


class SearchWithIdFilter(SearchFilter):
    id: IdType | None = None
