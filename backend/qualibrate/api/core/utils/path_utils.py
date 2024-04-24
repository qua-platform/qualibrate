import os
import sys
from datetime import date, datetime, time
from functools import cached_property, lru_cache
from pathlib import Path, PosixPath, WindowsPath
from typing import Optional

if sys.version_info[:2] == (3, 9):
    pass
else:
    pass


from qualibrate.api.core.types import IdType
from qualibrate.api.exceptions.classes.storage import (
    QRelativeNotSubpathException,
)


def resolve_and_check_relative(
    base_path: Path, subpath: os.PathLike[str]
) -> Path:
    """
    Build full path from base path and subpath. Raise error if build path isn't
    subpath of base path.

    Raises:
        ValueError: Built path isn't subpath of base path.
    """
    full = (base_path / Path(subpath)).resolve()
    if not full.is_relative_to(base_path):
        raise QRelativeNotSubpathException("Subpath isn't relative to base.")
    return full


if sys.platform == "win32" or sys.platform == "cygwin":
    ConcretePath = WindowsPath
else:
    ConcretePath = PosixPath


class NodesDatePath(ConcretePath):
    @cached_property
    def date(self) -> date:
        return self.datetime.date()

    @cached_property
    def datetime(self) -> datetime:
        return datetime.strptime(self.stem, "%Y-%m-%d")


class NodePath(ConcretePath):
    @cached_property
    def date_path(self) -> NodesDatePath:
        return NodesDatePath(self.parent)

    @cached_property
    def date(self) -> date:
        return self.date_path.date

    @cached_property
    def datetime(self) -> datetime:
        return self.date_path.datetime

    @lru_cache
    def get_node_id_name_time(
        self,
    ) -> tuple[Optional[IdType], str, Optional[time]]:
        parts = self.stem.split("_")
        if len(parts) < 3:
            return None, self.stem, None
        id_str, *node_name, node_time_str = parts
        node_id = (
            int(id_str[1:])
            if id_str.startswith("#") and id_str[1:].isnumeric()
            else None
        )
        if node_id is None:
            return None, self.stem, None
        node_name_str = "_".join(node_name)
        node_time = datetime.strptime(node_time_str, "%H%M%S").time()
        return node_id, node_name_str, node_time

    @cached_property
    def id(self) -> Optional[IdType]:
        return self.get_node_id_name_time()[0]

    @cached_property
    def node_name(self) -> str:
        return self.get_node_id_name_time()[1]

    @cached_property
    def time(self) -> Optional[time]:
        return self.get_node_id_name_time()[2]


# TODO: add class for project root
#   contains: iterdir that filters only date dir
