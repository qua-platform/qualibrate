import asyncio
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI

from qualibrate.core.utils.logger_m import logger
from qualibrate.runner.api.sockets.tasks import execution_history, run_status
from qualibrate.runner.core.app.ws_managers import get_output_logs_socket_manager

__all__ = ["app_lifespan"]


def _setup_log_broadcasting() -> None:
    """Wire up the logger to broadcast logs via WebSocket."""
    manager = get_output_logs_socket_manager()
    handler = logger.in_memory_handler

    def broadcast_log(log_entry: dict[str, Any]) -> None:
        # Schedule the async broadcast from the sync emit() call
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(manager.broadcast(log_entry))
        except RuntimeError:
            # No running event loop (e.g., during tests or non-async context)
            pass

    handler.set_broadcast_callback(broadcast_log)


@asynccontextmanager
async def app_lifespan(app: FastAPI) -> AsyncIterator[None]:
    _setup_log_broadcasting()
    # Start periodic tasks and capture task references
    run_status_task, execution_history_task = await asyncio.gather(
        run_status(), execution_history()
    )
    try:
        yield
    finally:
        # Clean up: remove the broadcast callback
        logger.in_memory_handler.set_broadcast_callback(None)
        # Cancel periodic tasks on shutdown
        run_status_task.cancel()
        execution_history_task.cancel()
        for task in (run_status_task, execution_history_task):
            try:
                await task
            except asyncio.CancelledError:
                pass
