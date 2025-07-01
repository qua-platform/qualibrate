import string
from collections.abc import Mapping, Sequence
from datetime import date
from typing import Any, Optional

from pydantic import BaseModel

AllowedSearchKeys = string.ascii_letters + string.digits + "-_*"

IdType = int
DocumentType = Mapping[str, Any]
DocumentSequenceType = Sequence[DocumentType]


class PageFilter(BaseModel):
    page: int = 1
    per_page: int = 50


class SearchFilter(BaseModel):
    name_part: Optional[str] = None
    min_node_id: IdType = 1
    max_node_id: Optional[int] = None
    min_date: Optional[date] = None
    max_date: Optional[date] = None


class SearchWithIdFilter(SearchFilter):
    id: Optional[IdType] = None
