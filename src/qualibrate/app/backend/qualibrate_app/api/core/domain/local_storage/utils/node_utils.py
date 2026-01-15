from collections.abc import Callable, Generator
from datetime import date
from functools import partial
from pathlib import Path
from typing import Any

from qualibrate_app.api.core.domain.local_storage.utils.local_path_id import (
    IdToLocalPath,
)
from qualibrate_app.api.core.types import (
    IdType,
    PageFilter,
    SearchFilter,
    SearchWithIdFilter,
)
from qualibrate_app.api.core.utils.path.node import NodePath
from qualibrate_app.api.core.utils.path.node_date import NodesDatePath


def find_latest_node(base_path: Path) -> NodePath | None:
    return max(
        map(NodePath, base_path.glob("*/#*")),
        key=lambda p: p.id or -1,
        default=None,
    )


def find_latest_node_id(base_path: Path) -> IdType:
    latest_node = find_latest_node(base_path)
    return (latest_node.id or -1) if latest_node else -1


def _validate_date_range(
    date_path: NodesDatePath,
    min_date: date | None = None,
    max_date: date | None = None,
) -> bool:
    try:
        dt = date_path.date
        if min_date is None and max_date is None:
            return True
        if min_date is not None and max_date is not None:
            return min_date <= dt <= max_date
        if min_date is not None:
            return min_date <= dt
        if max_date is not None:
            return dt <= max_date
        raise ValueError()
    except ValueError:
        return False


def _validate_node_id(
    node_path: NodePath, min_id: IdType, max_id: IdType
) -> bool:
    id_ = node_path.id
    return id_ is not None and (min_id <= id_ <= max_id)


def find_nodes_ids_by_filter(
    base_path: Path,
    *,
    search_filter: SearchWithIdFilter | None = None,
    project_name: str,
    descending: bool = False,
) -> Generator[IdType, None, None]:
    storage = IdToLocalPath().get_project_manager(project_name, base_path)
    yield from sorted(storage.get_ids(search_filter), reverse=descending)


def find_n_latest_nodes_ids(
    base_path: Path,
    *,
    pages_filter: PageFilter,
    search_filter: SearchFilter | None = None,
    project_name: str,
) -> Generator[IdType, None, None]:
    """
    Generator of n latest nodes ids
    """
    n = pages_filter.per_page
    page = pages_filter.page
    page -= 1

    max_node_id = (
        search_filter.max_node_id
        if search_filter is not None and search_filter.max_node_id is not None
        else find_latest_node_id(base_path)
    )
    node_id_max_val = max(0, max_node_id - page * pages_filter.per_page)
    if node_id_max_val == 0:
        return None
    node_id_min_val = max(
        (search_filter.min_node_id if search_filter is not None else 1),
        node_id_max_val - pages_filter.per_page + 1,
    )

    paths_mapping = IdToLocalPath()
    get_node_path = partial(
        paths_mapping.get_path,
        project=project_name,
        project_path=base_path,
    )
    min_node_path = get_node_path(id=node_id_min_val)
    min_node_path_date = (
        min_node_path.date if min_node_path is not None else None
    )
    min_node_date = max(
        min_node_path_date or date.min,
        (
            search_filter.min_date
            if search_filter is not None and search_filter.min_date is not None
            else date.min
        ),
    )
    max_node_path = get_node_path(id=node_id_max_val)
    max_node_path_date = (
        max_node_path.date if max_node_path is not None else None
    )
    max_node_date = min(
        max_node_path_date or date.max,
        (
            search_filter.max_date
            if search_filter is not None and search_filter.max_date is not None
            else date.max
        ),
    )
    date_filters: list[
        tuple[Callable[[NodesDatePath], bool], tuple[Any, ...]]
    ] = [
        (Path.is_dir, tuple()),
        (_validate_date_range, (min_node_date, max_node_date)),
    ]
    node_filters = [(_validate_node_id, (node_id_min_val, node_id_max_val))]
    name_pattern = (
        f"#*{search_filter.name_part}*"
        if search_filter is not None and search_filter.name_part is not None
        else "#*"
    )
    next_ = None
    for node_date in sorted(
        filter(
            lambda p: all(filter_(p, *args) for filter_, args in date_filters),
            map(NodesDatePath, base_path.iterdir()),
        ),
        reverse=True,
    ):
        node_paths = filter(
            lambda p: all(filter_(p, *args) for filter_, args in node_filters),
            map(NodePath, node_date.glob(name_pattern)),
        )
        node_path_ids = {
            int(path.stem[1:].split("_")[0]): path for path in node_paths
        }
        for _, node in sorted(
            node_path_ids.items(),
            key=lambda x: x[0],
            reverse=True,
        ):
            current = next_
            if current is None:
                next_ = node.id
                continue
            next_ = node.id
            n -= 1
            if n > 0:
                yield current
            else:
                # we have found all needed nodes; just exit from generator
                yield current
                return None
    # all nodes are checked;
    # if last item has already been yielded then just exits
    if next_ is None:
        return None
    # if one more item still exists then yielded it and then exists
    yield next_
    return None
