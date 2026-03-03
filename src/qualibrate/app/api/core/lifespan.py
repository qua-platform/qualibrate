import asyncio
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager, suppress

from fastapi import FastAPI

from qualibrate.app.api.sockets.tasks import update_snapshot_history_required
from qualibrate.core.infrastructure.DB.DBRegistry import DBRegistry
from qualibrate.core.utils.db_utils.db_startup import init_db_at_startup

__all__ = ["app_lifespan"]


@asynccontextmanager
async def app_lifespan(app: FastAPI) -> AsyncIterator[None]:
    init_db_at_startup()

    # Start periodic tasks and capture task references
    snapshot_history_task = await update_snapshot_history_required()
    try:
        yield
    finally:
        # Cancel periodic tasks on shutdown
        snapshot_history_task.cancel()
        with suppress(asyncio.CancelledError):
            await snapshot_history_task
        # make sure we disconnect all connections when api is closed
        DBRegistry.get().disconnect_all()
