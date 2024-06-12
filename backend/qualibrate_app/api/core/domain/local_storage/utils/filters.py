from qualibrate_app.api.core.utils.path.node import NodePath
from qualibrate_app.api.core.utils.path.node_date import NodesDatePath


def date_less_or_eq(date_path: NodesDatePath, date_to_compare: str) -> bool:
    # TODO: use date to compare
    return date_path.stem <= date_to_compare


def id_less_then_snapshot(node_path: NodePath, node_id_to_compare: int) -> bool:
    node_id = node_path.id
    if node_id is None:
        return False
    return int(node_id) < node_id_to_compare
