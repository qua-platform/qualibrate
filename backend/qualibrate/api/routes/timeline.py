from typing import Annotated, Union
from qualibrate_api_base.api_bases import DocumentType, DocumentsSequence

from fastapi import APIRouter, Depends

from qualibrate.api.core.snapshot import Snapshot
from qualibrate.api.dependencies.search import get_search_path
from qualibrate.api.models.snapshot_file import (
    SnapshotFile,
    SnapshotFileWithData,
)
from qualibrate.api.core.timeline import Timeline
from qualibrate.api.dependencies.bases import (
    get_snapshot_actions,
    get_timeline_actions,
)

timeline_router = APIRouter(prefix="/timeline")


@timeline_router.get("/last_snapshot", response_model=SnapshotFileWithData)
def get_last_snapshot(
    timeline: Annotated[Timeline, Depends(get_timeline_actions)],
) -> DocumentType:
    return timeline.get_last_snapshot("main")


@timeline_router.get("/history", response_model=list[SnapshotFile])
def get_history(
    timeline: Annotated[Timeline, Depends(get_timeline_actions)],
    snapshot: Annotated[Snapshot, Depends(get_snapshot_actions)],
) -> DocumentsSequence:
    return timeline.get_history("main", snapshot)


@timeline_router.get("/search/data/values")
def search_data_values(
    data_path: Annotated[list[Union[str, int]], Depends(get_search_path)],
    timeline: Annotated[Timeline, Depends(get_timeline_actions)],
    snapshot: Annotated[Snapshot, Depends(get_snapshot_actions)],
) -> DocumentsSequence:
    return timeline.search_data_values("main", data_path, snapshot)
