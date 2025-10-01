from collections.abc import Callable, Generator
from datetime import date
from functools import partial
from pathlib import Path
from typing import Any

from qualibrate_app.api.core.domain.local_storage._id_to_local_path import (
    IdToLocalPath,
)
from qualibrate_app.api.core.types import IdType
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


def find_n_latest_nodes_ids(
    base_path: Path,
    page: int,
    per_page: int,
    project_name: str,
    max_node_id: int | None = None,
) -> Generator[IdType, None, None]:
    """
    Generator of n latest nodes ids
    """
    n = per_page
    page -= 1

    max_node_id = (
        max_node_id
        if max_node_id is not None
        else find_latest_node_id(base_path)
    )
    node_id_max_val = max(0, max_node_id - page * per_page)
    if node_id_max_val == 0:
        return None
    node_id_min_val = max(1, node_id_max_val - per_page + 1)

    next_ = None
    paths_mapping = IdToLocalPath()
    get_node_path = partial(
        paths_mapping.get,
        project=project_name,
        project_path=base_path,
    )
    min_node_path = get_node_path(id=node_id_min_val)
    min_node_path_date = (
        min_node_path.date if min_node_path is not None else None
    )
    max_node_path = get_node_path(id=node_id_max_val)
    max_node_path_date = (
        max_node_path.date if max_node_path is not None else None
    )
    date_filters: list[
        tuple[Callable[[NodesDatePath], bool], tuple[Any, ...]]
    ] = [
        (Path.is_dir, tuple()),
        (_validate_date_range, (min_node_path_date, max_node_path_date)),
    ]
    node_filters = [(_validate_node_id, (node_id_min_val, node_id_max_val))]
    for node_date in sorted(
        filter(
            lambda p: all(filter_(p, *args) for filter_, args in date_filters),
            map(NodesDatePath, base_path.iterdir()),
        ),
        reverse=True,
    ):
        node_paths = filter(
            lambda p: all(filter_(p, *args) for filter_, args in node_filters),
            map(NodePath, node_date.glob("#*")),
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
