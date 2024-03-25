from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Path

from qualibrate.api.core.bases.storage import DataFileStorage, StorageLoadType
from qualibrate.api.core.local_storage.node import (
    NodeLoadType,
    NodeLocalStorage,
)
from qualibrate.api.core.types import DocumentType
from qualibrate.api.core.utils.request_utils import HTTPException422

local_storage_data_file_router = APIRouter(
    prefix="/data_file/{snapshot_id}", tags=["data file local storage"]
)


def _get_storage_instance(
    snapshot_id: Annotated[int, Path()],
) -> DataFileStorage:
    node = NodeLocalStorage(snapshot_id)
    try:
        node.load(NodeLoadType.Full)
    except NotADirectoryError as e:
        raise HTTPException422(detail=str(e))
    if node.storage is None:
        raise HTTPException422(detail="Output path not specified.")
    return node.storage


@local_storage_data_file_router.get("/")
def get_node_storage(
    storage: Annotated[DataFileStorage, Depends(_get_storage_instance)],
) -> str:
    return str(storage.path)


@local_storage_data_file_router.get("/content")
def get_node_storage_content(
    storage: Annotated[DataFileStorage, Depends(_get_storage_instance)],
) -> Optional[DocumentType]:
    storage.load(StorageLoadType.Full)
    return storage.data
