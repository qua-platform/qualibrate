from pathlib import Path

from qualibrate.api.core.local_storage.utils.node_utils import id_from_node_name


def date_less_or_eq(date_path: Path, date_to_compare: str) -> bool:
    return date_path.stem <= date_to_compare


def id_less_then_snapshot(node_path: Path, node_id_to_compare: int) -> bool:
    return id_from_node_name(node_path.stem) < node_id_to_compare
