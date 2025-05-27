from functools import cache

from qualibrate_runner.core.app.ws_manager import SocketConnectionManager


@cache
def get_run_status_socket_manager() -> SocketConnectionManager:
    return SocketConnectionManager()


@cache
def get_execution_history_socket_manager() -> SocketConnectionManager:
    return SocketConnectionManager()
