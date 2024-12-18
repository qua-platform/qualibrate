from collections.abc import Mapping
from functools import cache
from typing import Annotated

from fastapi import Depends, HTTPException

from qualibrate_runner.config import (
    QualibrateRunnerSettings,
    State,
    get_settings,
)
from qualibrate_runner.core.types import QGraphType, QLibraryType, QNodeType


@cache
def get_state() -> State:
    return State()


@cache
def get_cached_library(
    settings: Annotated[QualibrateRunnerSettings, Depends(get_settings)],
) -> QLibraryType:
    return settings.calibration_library_resolver(
        settings.calibration_library_folder
    )


def get_library(
    library: Annotated[QLibraryType, Depends(get_cached_library)],
    rescan: bool = False,
) -> QLibraryType:
    if rescan:
        library.rescan()
    return library


def get_nodes(
    library: Annotated[QLibraryType, Depends(get_library)],
) -> Mapping[str, QNodeType]:
    return library.get_nodes()


def get_graphs(
    library: Annotated[QLibraryType, Depends(get_library)],
) -> Mapping[str, QGraphType]:
    return library.get_graphs()


def get_node(
    name: str,
    nodes: Annotated[Mapping[str, QNodeType], Depends(get_nodes)],
) -> QNodeType:
    node = nodes.get(name)
    if node is None:
        raise HTTPException(status_code=422, detail=f"Unknown node name {name}")
    return node


def get_graph(
    name: str,
    graphs: Annotated[Mapping[str, QGraphType], Depends(get_graphs)],
) -> QGraphType:
    graph = graphs.get(name)
    if graph is None:
        raise HTTPException(
            status_code=422, detail=f"Unknown graph name {name}"
        )
    return graph
