import asyncio
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Any

from fastapi import FastAPI

from qualibrate.core.utils.logger_m import logger
from qualibrate.runner.api.sockets.tasks import execution_history, run_status
from qualibrate.runner.core.app.ws_managers import get_output_logs_socket_manager

__all__ = ["app_lifespan"]


def _setup_log_broadcasting(loop: asyncio.AbstractEventLoop) -> None:
    """Wire up the logger to broadcast logs via WebSocket.

    Args:
        loop: The event loop to use for scheduling broadcasts.
              Must be passed because node.run() executes synchronously
              and asyncio.get_running_loop() won't work from sync context.
    """
    manager = get_output_logs_socket_manager()
    handler = logger.in_memory_handler

    def broadcast_log(log_entry: dict[str, Any]) -> None:
        # Schedule the async broadcast from the sync emit() call
        # Use run_coroutine_threadsafe since we might be called from sync context
        # while the event loop is blocked (e.g., during node.run())
        try:
            # Convert datetime to ISO string for JSON serialization
            json_safe_entry = log_entry.copy()
            if isinstance(json_safe_entry.get("asctime"), datetime):
                json_safe_entry["asctime"] = json_safe_entry["asctime"].isoformat()
            num_connections = len(manager.active_connections)
            if num_connections > 0:
                # Use run_coroutine_threadsafe to schedule on the saved event loop
                asyncio.run_coroutine_threadsafe(manager.broadcast(json_safe_entry), loop)
        except Exception:
            # Log errors but don't crash the logging system
            pass

    handler.set_broadcast_callback(broadcast_log)


@asynccontextmanager
async def app_lifespan(app: FastAPI) -> AsyncIterator[None]:
    # Get the running event loop to pass to sync broadcast callback
    loop = asyncio.get_running_loop()
    _setup_log_broadcasting(loop)
    # Start periodic tasks and capture task references
    run_status_task, execution_history_task = await asyncio.gather(run_status(), execution_history())
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
