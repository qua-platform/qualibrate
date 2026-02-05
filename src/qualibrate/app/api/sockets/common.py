from typing import Annotated

from fastapi import APIRouter, Depends
from starlette.websockets import WebSocket, WebSocketDisconnect

from qualibrate.app.api.core.socket.ws_manager import (
    SocketConnectionManagerList,
)
from qualibrate.app.api.core.socket.ws_managers import (
    get_need_to_update_snapshots_history_socket_manager,
)

common_ws_router = APIRouter()


@common_ws_router.websocket("/update_snapshots_history_required")
async def run_status_subscribe(
    websocket: WebSocket,
    *,
    manager: Annotated[
        SocketConnectionManagerList,
        Depends(get_need_to_update_snapshots_history_socket_manager),
    ],
) -> None:
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
