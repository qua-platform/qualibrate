from datetime import datetime
from pathlib import Path
from typing import Callable, Generator, Optional, Sequence

from qualibrate.api.core.types import IdType


def id_from_node_name(node_name: str) -> IdType:
    return int(node_name.split("_")[0][1:])


def find_latest_node_id(base_path: Path) -> IdType:
    def _get_key(p: Path) -> int:
        return id_from_node_name(p.stem)

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
                next_ = id_from_node_name(node.stem)
                continue
            next_ = id_from_node_name(node.stem)
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
