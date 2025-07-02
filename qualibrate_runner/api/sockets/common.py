from typing import Annotated

from fastapi import APIRouter, Depends
from starlette.websockets import WebSocket, WebSocketDisconnect

from qualibrate_runner.core.app.ws_manager import (
    SocketConnectionManagerList,
    SocketConnectionManagerMapping,
)
from qualibrate_runner.core.app.ws_managers import (
    get_execution_history_socket_manager,
    get_run_status_socket_manager,
)

common_ws_router = APIRouter()


@common_ws_router.websocket("/run_status")
async def run_status_subscribe(
    websocket: WebSocket,
    *,
    manager: Annotated[
        SocketConnectionManagerList, Depends(get_run_status_socket_manager)
    ],
) -> None:
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)


@common_ws_router.websocket("/workflow_execution_history")
async def workflow_execution_history_subscribe(
    websocket: WebSocket,
    *,
    reverse: bool = True,
    manager: Annotated[
        SocketConnectionManagerMapping[bool],
        Depends(get_execution_history_socket_manager),
    ],
) -> None:
    await manager.connect(reverse, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(reverse, websocket)
