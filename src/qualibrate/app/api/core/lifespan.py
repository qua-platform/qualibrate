import asyncio
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from qualibrate.app.api.sockets.tasks import update_snapshot_history_required

__all__ = ["app_lifespan"]


@asynccontextmanager
async def app_lifespan(app: FastAPI) -> AsyncIterator[None]:
    await asyncio.gather(update_snapshot_history_required())
    yield
