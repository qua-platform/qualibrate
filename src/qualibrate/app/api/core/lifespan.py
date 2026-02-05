import asyncio
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from qualibrate.app.api.sockets.tasks import update_snapshot_history_required

__all__ = ["app_lifespan"]


@asynccontextmanager
async def app_lifespan(app: FastAPI) -> AsyncIterator[None]:
    # Start periodic tasks and capture task references
    snapshot_history_task = await update_snapshot_history_required()
    try:
        yield
    finally:
        # Cancel periodic tasks on shutdown
        snapshot_history_task.cancel()
        try:
            await snapshot_history_task
        except asyncio.CancelledError:
            pass
