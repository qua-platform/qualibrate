from collections import defaultdict
from collections.abc import Hashable
from typing import Any, Generic, TypeVar

from fastapi import WebSocket


class SocketConnectionManagerList:
    def __init__(self) -> None:
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: Any) -> None:
        for connection in self.active_connections:
            await connection.send_json(message)

    @property
    def any_subscriber(self) -> bool:
        return len(self.active_connections) > 0


KT = TypeVar("KT", bound=Hashable)


class SocketConnectionManagerMapping(Generic[KT]):
    def __init__(self) -> None:
        self.active_connections: dict[KT, list[WebSocket]] = defaultdict(list)

    async def connect(self, key: KT, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections[key].append(websocket)

    def disconnect(self, key: KT, websocket: WebSocket) -> None:
        self.active_connections[key].remove(websocket)

    async def broadcast(self, key: KT, message: Any) -> None:
        if not self.any_subscriber_for(key):
            return
        for connection in self.active_connections[key]:
            await connection.send_json(message)

    @property
    def any_subscriber(self) -> bool:
        return len(self.active_connections) > 0 and any(
            map(len, self.active_connections.values())
        )

    def any_subscriber_for(self, key: KT) -> bool:
        return (
            key in self.active_connections
            and len(self.active_connections[key]) > 0
        )
