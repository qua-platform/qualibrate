import asyncio
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from qualibrate_runner.api.sockets.tasks import execution_history, run_status

__all__ = ["app_lifespan"]


@asynccontextmanager
async def app_lifespan(app: FastAPI) -> AsyncIterator[None]:
    await asyncio.gather(run_status(), execution_history())
    yield
