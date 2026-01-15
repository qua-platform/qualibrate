from typing import Annotated

from fastapi import APIRouter, Depends, Path
from qualibrate_config.models import QualibrateConfig, StorageType

from qualibrate_app.api.core.domain.bases.node import NodeLoadType
from qualibrate_app.api.core.domain.bases.storage import (
    DataFileStorage,
    StorageLoadType,
    StorageLoadTypeToLoadTypeFlag,
)
from qualibrate_app.api.core.domain.local_storage.node import NodeLocalStorage
from qualibrate_app.api.core.domain.timeline_db.node import NodeTimelineDb
from qualibrate_app.api.core.types import DocumentType
from qualibrate_app.api.core.utils.request_utils import HTTPException422
from qualibrate_app.config import (
    get_settings,
)

data_file_router = APIRouter(
    prefix="/data_file/{node_id}", tags=["data file"], deprecated=True
)


def _get_storage_instance(
    node_id: Annotated[int, Path()],
    settings: Annotated[QualibrateConfig, Depends(get_settings)],
) -> DataFileStorage:
    node_types: dict[
        StorageType, type[NodeLocalStorage] | type[NodeTimelineDb]
    ] = {
        StorageType.local_storage: NodeLocalStorage,
        StorageType.timeline_db: NodeTimelineDb,
    }
    node = node_types[settings.storage.type](node_id, settings=settings)
    try:
        node.load(NodeLoadType.Full)
    except NotADirectoryError as e:
        raise HTTPException422(detail=str(e)) from None
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
) -> DocumentType | None:
    storage.load_from_flag(StorageLoadTypeToLoadTypeFlag[load_type])
    return storage.data
