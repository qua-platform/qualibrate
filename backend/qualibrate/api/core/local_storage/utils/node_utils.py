from pathlib import Path

from qualibrate.api.core.types import IdType


def find_latest_node_id(base_path: Path) -> IdType:
    def _get_key(p: Path) -> int:
        return int(p.stem.split("_")[0][1:])

    return _get_key(max(base_path.glob("*/#*"), key=_get_key))
