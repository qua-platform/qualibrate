from datetime import date, datetime, time
from functools import cached_property, lru_cache

from qualibrate_app.api.core.types import IdType
from qualibrate_app.api.core.utils.path import ConcretePath
from qualibrate_app.api.core.utils.path.node_date import NodesDatePath

__all__ = ["NodePath"]


@lru_cache(maxsize=16)
def _get_node_id_name_time(
    node_path: "NodePath",
) -> tuple[IdType | None, str, time | None]:
    parts = node_path.stem.split("_")
    if len(parts) < 3:
        return None, node_path.stem, None
    id_str, *node_name, node_time_str = parts
    node_id = (
        int(id_str[1:])
        if id_str.startswith("#") and id_str[1:].isnumeric()
        else None
    )
    if node_id is None:
        return None, node_path.stem, None
    node_name_str = "_".join(node_name)

    try:
        node_time = datetime.strptime(node_time_str, "%H%M%S").time()
    except ValueError:
        node_time = None
    return node_id, node_name_str, node_time


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

    def get_node_id_name_time(
        self,
    ) -> tuple[IdType | None, str, time | None]:
        return _get_node_id_name_time(self)

    @cached_property
    def id(self) -> IdType | None:
        return self.get_node_id_name_time()[0]

    @cached_property
    def node_name(self) -> str:
        return self.get_node_id_name_time()[1]

    @cached_property
    def time(self) -> time | None:
        return self.get_node_id_name_time()[2]
