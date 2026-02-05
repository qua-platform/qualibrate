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


def add_tags_to_snapshot(snapshot: dict[str, Any]) -> dict[str, Any]:
    """Add tags=None to a snapshot dict for SimplifiedSnapshotWithMetadata format."""
    return {**snapshot, "tags": None}


def add_tags_to_snapshots(snapshots: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Add tags=None to a list of snapshot dicts."""
    return [add_tags_to_snapshot(s) for s in snapshots]
