from typing import Annotated, Optional, Type, Union

from fastapi import APIRouter, Depends, Path

from qualibrate.api.core.bases.node import NodeBase, NodeLoadType
from qualibrate.api.core.bases.storage import DataFileStorage, StorageLoadType
from qualibrate.api.core.local_storage.node import NodeLocalStorage
from qualibrate.api.core.timeline_db.node import NodeTimelineDb
from qualibrate.api.core.types import DocumentType
from qualibrate.api.core.utils.request_utils import HTTPException422
from qualibrate.config import QualibrateSettings, StorageType, get_settings

data_file_router = APIRouter(prefix="/data_file/{node_id}", tags=["data file"])


def _get_storage_instance(
    node_id: Annotated[int, Path()],
    settings: Annotated[QualibrateSettings, Depends(get_settings)],
) -> DataFileStorage:
    node_types: dict[
        StorageType, Union[Type[NodeLocalStorage], Type[NodeTimelineDb]]
    ] = {
        StorageType.local_storage: NodeLocalStorage,
        StorageType.timeline_db: NodeTimelineDb,
    }
    node = node_types[settings.storage_type](node_id)
    try:
        node.load(NodeLoadType.Full)
    except NotADirectoryError as e:
        raise HTTPException422(detail=str(e))
    if node.storage is None:
        raise HTTPException422(detail="Output path not specified.")
    return node.storage


@data_file_router.get("/")
def get_node_storage(
    storage: Annotated[DataFileStorage, Depends(_get_storage_instance)],
) -> str:
    return str(storage.path)


@data_file_router.get("/content")
def get_node_storage_content(
    *,
    load_type: StorageLoadType = StorageLoadType.Full,
    storage: Annotated[DataFileStorage, Depends(_get_storage_instance)],
) -> Optional[DocumentType]:
    storage.load(load_type)
    return storage.data
