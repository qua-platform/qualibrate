from pathlib import Path

from qualibrate.api.core.local_storage.utils.node_utils import (
    get_node_id_name_time,
)


def date_less_or_eq(date_path: Path, date_to_compare: str) -> bool:
    return date_path.stem <= date_to_compare


def id_less_then_snapshot(node_path: Path, node_id_to_compare: int) -> bool:
    node_id, _, _ = get_node_id_name_time(node_path)
    if node_id is None:
        return False
    return node_id < node_id_to_compare
