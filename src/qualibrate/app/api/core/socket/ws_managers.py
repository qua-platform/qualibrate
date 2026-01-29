from functools import cache

from qualibrate.app.api.core.socket.ws_manager import (
    SocketConnectionManagerList,
)

__all__ = ["get_need_to_update_snapshots_history_socket_manager"]


@cache
def get_need_to_update_snapshots_history_socket_manager() -> SocketConnectionManagerList:
    return SocketConnectionManagerList()
