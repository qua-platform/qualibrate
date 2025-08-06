from typing import Any

EMPTY_METADATA = {
    "name": None,
    "description": None,
    "run_duration": None,
    "run_start": None,
    "run_end": None,
    "status": None,
}


def update_snapshot_minified_response(
    snapshot: dict[str, Any],
) -> dict[str, Any]:
    snapshot["metadata"].update(EMPTY_METADATA)
    snapshot["metadata"].pop("data_path", None)
    snapshot.update({"data": None})
    return snapshot
