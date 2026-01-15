from functools import cache

from qualibrate_runner.core.app.ws_manager import (
    SocketConnectionManagerList,
    SocketConnectionManagerMapping,
)


@cache
def get_run_status_socket_manager() -> SocketConnectionManagerList:
    return SocketConnectionManagerList()


@cache
def get_execution_history_socket_manager() -> SocketConnectionManagerMapping[
    bool
]:
    return SocketConnectionManagerMapping[bool]()
