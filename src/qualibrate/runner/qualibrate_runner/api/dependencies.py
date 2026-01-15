import asyncio
from functools import cache
from typing import Annotated, cast

from fastapi import Depends, HTTPException
from qualibrate.runnables.runnable_collection import RunnableCollection
from qualibrate_config.models import CalibrationLibraryConfig

from qualibrate_runner.config import State, get_cl_settings
from qualibrate_runner.core.types import QGraphType, QLibraryType, QNodeType

library_rescan_lock = asyncio.Lock()


@cache
def get_state() -> State:
    return State()


@cache
def get_cached_library(
    config: Annotated[CalibrationLibraryConfig, Depends(get_cl_settings)],
) -> QLibraryType:
    return cast(QLibraryType, config.resolver(config.folder))


async def get_library(
    library: Annotated[QLibraryType, Depends(get_cached_library)],
    rescan: bool = False,
) -> QLibraryType:
    async with library_rescan_lock:
        if rescan:
            library.rescan()
    return library


def get_nodes(
    library: Annotated[QLibraryType, Depends(get_library)],
) -> RunnableCollection[str, QNodeType]:
    return library.get_nodes()


def get_graphs(
    library: Annotated[QLibraryType, Depends(get_library)],
) -> RunnableCollection[str, QGraphType]:
    return library.get_graphs()


def get_node_copy(
    name: str,
    nodes: Annotated[RunnableCollection[str, QNodeType], Depends(get_nodes)],
) -> QNodeType:
    node = nodes.get(name)
    if node is None:
        raise HTTPException(status_code=422, detail=f"Unknown node name {name}")
    return node


def get_node_nocopy(
    name: str,
    nodes: Annotated[RunnableCollection[str, QNodeType], Depends(get_nodes)],
) -> QNodeType:
    node = nodes.get_nocopy(name)
    if node is None:
        raise HTTPException(status_code=422, detail=f"Unknown node name {name}")
    return node


def get_graph_nocopy(
    name: str,
    graphs: Annotated[RunnableCollection[str, QGraphType], Depends(get_graphs)],
) -> QGraphType:
    graph = graphs.get_nocopy(name)
    if graph is None:
        raise HTTPException(
            status_code=422, detail=f"Unknown graph name {name}"
        )
    return graph
