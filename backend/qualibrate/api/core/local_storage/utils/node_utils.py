from datetime import datetime, time
from pathlib import Path
from typing import Callable, Generator, Optional, Sequence

from qualibrate.api.core.types import IdType


def get_node_id_name_time(
    node_path: Path,
) -> tuple[Optional[IdType], str, Optional[time]]:
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
    node_time = datetime.strptime(node_time_str, "%H%M%S").time()
    return node_id, node_name_str, node_time


def find_latest_node_id(base_path: Path) -> IdType:
    def _get_key(p: Path) -> int:
        node_id, _, _ = get_node_id_name_time(p)
        return node_id if node_id is not None else -1

    return _get_key(max(base_path.glob("*/#*"), key=_get_key))


def find_n_latest_nodes_ids(
    base_path: Path,
    n: int,
    date_filters: Optional[Sequence[Callable[[Path], bool]]] = None,
    node_filters: Optional[Sequence[Callable[[Path], bool]]] = None,
) -> Generator[IdType, None, None]:
    """
    Generator of n latest nodes ids
    """

    def _validate_date(date_path: Path) -> bool:
        try:
            datetime.strptime(date_path.stem, "%Y-%m-%d")
            return True
        except ValueError:
            return False

    next_ = None
    if date_filters is None:
        date_filters = []
    date_filters = [Path.is_dir, _validate_date, *date_filters]
    node_filters = node_filters if node_filters is not None else []
    for date in sorted(
        filter(
            lambda p: all(filter_(p) for filter_ in date_filters),
            base_path.iterdir(),
        ),
        reverse=True,
    ):
        nodes = date.glob("#*")
        for node in sorted(
            filter(
                lambda p: all(filter_(p) for filter_ in node_filters),
                nodes,
            ),
            reverse=True,
        ):
            current = next_
            if current is None:
                next_, _, _ = get_node_id_name_time(node)
                print(next_)
                continue
            next_, _, _ = get_node_id_name_time(node)
            n -= 1
            if n > 0:
                yield current
            else:
                yield current
                return None
    if next_ is None:
        return None
    yield next_
    return None
