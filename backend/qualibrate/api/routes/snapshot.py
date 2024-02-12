from typing import Annotated, Union, Optional
from qualibrate_api_base.api_bases import DocumentType, DocumentsSequence

from fastapi import APIRouter, Depends

from qualibrate.api.core.snapshot import Snapshot
from qualibrate.api.models.snapshot_file import (
    SnapshotFile,
    SnapshotFileWithData,
)
from qualibrate.api.dependencies.path_params import get_snapshot_filename
from qualibrate.api.dependencies.bases import get_snapshot_actions
from qualibrate.api.dependencies.search import get_search_path

snapshot_router = APIRouter(prefix="/{snapshot}", tags=["snapshot"])


@snapshot_router.get("/", response_model=SnapshotFileWithData)
def get(
    snapshot_filename: Annotated[str, Depends(get_snapshot_filename)],
    snapshot: Annotated[Snapshot, Depends(get_snapshot_actions)],
) -> Optional[DocumentType]:
    return snapshot.get(snapshot_filename)


@snapshot_router.get("/search/data/values")
def get_values(
    snapshot_filename: Annotated[str, Depends(get_snapshot_filename)],
    data_path: Annotated[list[Union[str, int]], Depends(get_search_path)],
    snapshot: Annotated[Snapshot, Depends(get_snapshot_actions)],
) -> DocumentsSequence:
    return snapshot.search_data_values(snapshot_filename, data_path)


@snapshot_router.get("/search/data/value/any_depth")
def get_values_any_depth(
    snapshot_filename: Annotated[str, Depends(get_snapshot_filename)],
    target_key: str,
    snapshot: Annotated[Snapshot, Depends(get_snapshot_actions)],
) -> DocumentsSequence:
    return snapshot.search_data_values_any_depth(snapshot_filename, target_key)


@snapshot_router.get("/history", response_model=list[SnapshotFile])
def get_history(
    snapshot_filename: Annotated[str, Depends(get_snapshot_filename)],
    snapshot: Annotated[Snapshot, Depends(get_snapshot_actions)],
) -> DocumentsSequence:
    return snapshot.get_history(snapshot_filename)
