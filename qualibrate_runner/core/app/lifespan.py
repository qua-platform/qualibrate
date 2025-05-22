from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

__all__ = ["app_lifespan"]


@asynccontextmanager
async def app_lifespan(app: FastAPI) -> AsyncIterator[None]:
    yield
