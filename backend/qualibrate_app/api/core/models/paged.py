import math
from typing import Generic, TypeVar

from pydantic import BaseModel, computed_field

ItemT = TypeVar("ItemT")


class PagedCollection(BaseModel, Generic[ItemT]):
    page: int
    per_page: int
    total_items: int
    items: list[ItemT]

    @computed_field
    def has_next_page(self) -> bool:
        if self.total_items > 0:
            return self.page < self.total_pages  # type: ignore[operator]
        return len(self.items) == self.per_page

    @computed_field
    def total_pages(self) -> int:
        return math.ceil(self.total_items / self.per_page)
