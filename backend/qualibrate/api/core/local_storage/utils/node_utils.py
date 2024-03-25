from datetime import datetime
from pathlib import Path
from typing import Generator

from qualibrate.api.core.types import IdType


def id_from_node_name(node_name: str) -> IdType:
    return int(node_name.split("_")[0][1:])


def find_latest_node_id(base_path: Path) -> IdType:
    def _get_key(p: Path) -> int:
        return id_from_node_name(p.stem)

    return _get_key(max(base_path.glob("*/#*"), key=_get_key))


def find_n_latest_nodes_ids(
    base_path: Path, n: int
) -> Generator[IdType, None, None]:
    """
    Generator of n latest nodes ids
    """

    def _validate_date(date_str: str) -> bool:
        try:
            datetime.strptime(date_str, "%Y-%m-%d")
            return True
        except ValueError:
            return False

    next_ = None

    for date in sorted(
        filter(
            lambda p: p.is_dir() and _validate_date(p.stem), base_path.iterdir()
        ),
        reverse=True,
    ):
        nodes = date.glob("#*")
        for node in sorted(nodes, reverse=True):
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
