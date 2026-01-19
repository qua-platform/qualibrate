from datetime import date, datetime
from functools import cached_property

from qualibrate_app.api.core.utils.path import ConcretePath

__all__ = ["NodesDatePath"]


class NodesDatePath(ConcretePath):
    @cached_property
    def date(self) -> date:
        return self.datetime.date()

    @cached_property
    def datetime(self) -> datetime:
        return datetime.strptime(self.stem, "%Y-%m-%d")
