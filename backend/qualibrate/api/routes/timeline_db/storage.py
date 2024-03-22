from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Path

from qualibrate.api.core.types import DocumentType
from qualibrate.api.core.bases.storage import DataFileStorage, StorageLoadType
from qualibrate.api.core.utils.request_utils import HTTPException422
from qualibrate.api.core.timeline_db.node import NodeTimelineDb, NodeLoadType

timeline_db_storage_router = APIRouter(
    prefix="/storage/{snapshot_id}", tags=["storage timeline db"]
)


def _get_storage_instance(
    snapshot_id: Annotated[int, Path()],
) -> DataFileStorage:
    node = NodeTimelineDb(snapshot_id)
    try:
        node.load(NodeLoadType.Full)
    except NotADirectoryError as e:
        raise HTTPException422(detail=str(e))
    if node.storage is None:
        raise HTTPException422(detail="Output path not specified.")
    return node.storage


@timeline_db_storage_router.get("/")
def get_node_storage(
    storage: Annotated[DataFileStorage, Depends(_get_storage_instance)],
) -> str:
    return str(storage.path)


@timeline_db_storage_router.get("/content")
def get_node_storage_content(
    storage: Annotated[DataFileStorage, Depends(_get_storage_instance)],
) -> Optional[DocumentType]:
    storage.load(StorageLoadType.Full)
    return storage.data
