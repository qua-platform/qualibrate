from collections import defaultdict
from collections.abc import Iterable
from datetime import date
from itertools import chain
from pathlib import Path

from qualibrate_app.api.core.types import (
    IdType,
    SearchWithIdFilter,
)
from qualibrate_app.api.core.utils.path.node import NodePath

__all__ = ["IdToProjectLocalPath"]


class IdToProjectLocalPath:
    def __init__(self, project_name: str, project_path: Path) -> None:
        self._project_name = project_name
        self._project_path = project_path
        self._id2path: dict[IdType, NodePath] = {}
        self._date2id: defaultdict[date, list[IdType]] = defaultdict(list)
        self._name2id: defaultdict[str, list[IdType]] = defaultdict(list)
        self._fill_full()

    def _add_node(self, node_path: NodePath) -> None:
        node_id = node_path.id
        if node_id is None:
            return
        self._id2path[node_id] = node_path
        self._date2id[node_path.date].append(node_id)
        self._name2id[node_path.node_name].append(node_id)

    def _fill_full(self) -> None:
        for node_dir in self._project_path.glob("*/#*"):
            if not node_dir.is_dir():
                continue
            try:
                node_path = NodePath(node_dir)
            except ValueError:
                continue
            self._add_node(node_path)

    def _fill_date(self, dt: date | None = None) -> None:
        if dt is None:
            dt = date.today()
        today_dir = self._project_path / dt.isoformat()
        if not today_dir.is_dir():
            return
        max_exists_node_id = max(self._date2id.get(dt, []), default=-1)
        today_nodes = []
        for node_dir in today_dir.glob("#*"):
            if not node_dir.is_dir():
                continue
            try:
                node_path = NodePath(node_dir)
            except ValueError:
                continue
            today_nodes.append(node_path)
        to_add: list[NodePath] = list(
            filter(
                lambda node: node.id and (node.id > max_exists_node_id),
                today_nodes,
            )
        )
        if len(to_add) == 0:
            return
        for node_path in to_add:
            self._add_node(node_path)

    def _get_suited_ids_by_name_part(self, name_part: str) -> set[IdType]:
        return set(
            chain.from_iterable(
                [
                    ids
                    for name, ids in self._name2id.items()
                    if name_part in name
                ]
            )
        )

    def _get_suited_ids_by_date(
        self,
        date_start: date | None = None,
        date_end: date | None = None,
    ) -> set[IdType]:
        date_start = date_start or date.min
        date_end = date_end or date.max
        if date_start > date_end:
            return set()
        return set(
            chain.from_iterable(
                [
                    ids
                    for dt, ids in self._date2id.items()
                    if date_start <= dt <= date_end
                ]
            )
        )

    def _get_suited_ids_by_id_range(
        self,
        id: IdType | None = None,
        min_id: IdType | None = None,
        max_id: IdType | None = None,
    ) -> set[IdType]:
        existing_ids: Iterable[IdType] = self._id2path.keys()
        if id is not None:
            return {id} if id in existing_ids else set()
        if min_id is None and max_id is None:
            return set(existing_ids)
        if min_id is not None and max_id is not None:
            return set(filter(lambda id: min_id <= id <= max_id, existing_ids))
        if min_id is not None:
            return set(filter(lambda id: min_id <= id, existing_ids))
        if max_id is not None:
            return set(filter(lambda id: id <= max_id, existing_ids))
        raise RuntimeError("Unexpected case")

    def get_ids(
        self,
        filters: SearchWithIdFilter | None = None,
    ) -> set[IdType]:
        self._fill_date()
        if filters is None:
            return self._get_suited_ids_by_id_range()
        if (
            filters.min_node_id
            and filters.max_node_id
            and filters.min_node_id > filters.max_node_id
        ):
            return set()
        allowed_ids: set[IdType] | None = None
        if filters.name_part:
            allowed_ids = self._get_suited_ids_by_name_part(filters.name_part)
        if allowed_ids is not None and len(allowed_ids) == 0:
            return set()
        if filters.min_date or filters.max_date:
            suited_ids_by_date = self._get_suited_ids_by_date(
                filters.min_date, filters.max_date
            )
            if allowed_ids is not None:
                allowed_ids &= suited_ids_by_date
            else:
                allowed_ids = suited_ids_by_date
        suited_ids_by_range = self._get_suited_ids_by_id_range(
            filters.id, filters.min_node_id, filters.max_node_id
        )
        if allowed_ids is not None:
            allowed_ids &= suited_ids_by_range
        else:
            allowed_ids = suited_ids_by_range
        return allowed_ids

    def __len__(self) -> int:
        return len(self._id2path)

    def get_path(
        self,
        id: IdType,
    ) -> NodePath | None:
        return self._id2path.get(id)

    @property
    def max_id(self) -> IdType:
        return max(self._id2path.keys(), default=-1)
