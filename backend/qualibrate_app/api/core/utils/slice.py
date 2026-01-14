import itertools
from collections.abc import Iterable, Sequence
from typing import TypeVar

from qualibrate_app.api.core.types import PageFilter

T = TypeVar("T")


def get_page_slice(iterable: Iterable[T], page: PageFilter) -> Sequence[T]:
    start = page.per_page * (page.page - 1)
    end = page.per_page * page.page
    return list(itertools.islice(iterable, start, end))
