from functools import cache

from qualibrate.runner.core.app.ws_manager import (
    SocketConnectionManagerList,
    SocketConnectionManagerMapping,
)


@cache
def get_run_status_socket_manager() -> SocketConnectionManagerList:
    return SocketConnectionManagerList()


@cache
def get_execution_history_socket_manager() -> SocketConnectionManagerMapping[bool]:
    return SocketConnectionManagerMapping[bool]()


@cache
def get_output_logs_socket_manager() -> SocketConnectionManagerList:
    return SocketConnectionManagerList()
