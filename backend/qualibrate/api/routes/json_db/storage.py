import base64
from typing import Annotated, Sequence, Mapping

from fastapi import APIRouter, Depends, Path

from qualibrate.api.core.json_db.node import NodeJsonDb, NodeLoadType
from qualibrate.api.core.json_db.storage import StorageJsonDb
from qualibrate.api.core.utils.request_utils import HTTPException422

json_db_storage_router = APIRouter(
    prefix="/storage/{snapshot_id}", tags=["storage"]
)


def _get_storage_instance(snapshot_id: Annotated[int, Path()]) -> StorageJsonDb:
    node = NodeJsonDb(snapshot_id)
    try:
        node.load(NodeLoadType.Full)
    except NotADirectoryError as e:
        raise HTTPException422(detail=str(e))
    if node.storage is None:
        raise HTTPException422(detail="Output path not specified.")
    return node.storage


@json_db_storage_router.get("/")
def get_node_storage(
    storage: Annotated[StorageJsonDb, Depends(_get_storage_instance)],
) -> str:
    return str(storage.path)


@json_db_storage_router.get("/content")
def get_node_storage_content(
    storage: Annotated[StorageJsonDb, Depends(_get_storage_instance)],
) -> Sequence[str]:
    return list(map(str, storage.list_elements()))


@json_db_storage_router.get("/images")
def get_node_storage_images_list(
    storage: Annotated[StorageJsonDb, Depends(_get_storage_instance)],
) -> Sequence[str]:
    return list(map(str, storage.list_typed_elements("*.png")))


@json_db_storage_router.get("/images/content")
def get_node_storage_images(
    storage: Annotated[StorageJsonDb, Depends(_get_storage_instance)],
) -> Mapping[str, str]:
    m = storage.get_images_content("*.png")
    return {
        name: base64.b64encode(content).decode() for name, content in m.items()
    }
