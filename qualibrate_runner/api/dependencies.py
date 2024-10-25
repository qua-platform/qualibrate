from collections.abc import Mapping
from functools import cache
from typing import Annotated

from fastapi import Depends, HTTPException
from qualibrate.qualibration_graph import QualibrationGraph
from qualibrate.qualibration_library import QualibrationLibrary
from qualibrate.qualibration_node import QualibrationNode

from qualibrate_runner.config import (
    QualibrateRunnerSettings,
    State,
    get_settings,
)


@cache
def get_state() -> State:
    return State()


@cache
def get_cached_library(
    settings: Annotated[QualibrateRunnerSettings, Depends(get_settings)],
) -> QualibrationLibrary:
    return settings.calibration_library_resolver(
        settings.calibration_library_folder
    )


def get_library(
    library: Annotated[QualibrationLibrary, Depends(get_cached_library)],
    rescan: bool = False,
) -> QualibrationLibrary:
    if rescan:
        library.rescan()
    return library


def get_nodes(
    library: Annotated[QualibrationLibrary, Depends(get_library)],
) -> Mapping[str, QualibrationNode]:
    return library.get_nodes()


def get_graphs(
    library: Annotated[QualibrationLibrary, Depends(get_library)],
) -> Mapping[str, QualibrationGraph]:
    return library.get_graphs()


def get_node(
    name: str,
    nodes: Annotated[Mapping[str, QualibrationNode], Depends(get_nodes)],
) -> QualibrationNode:
    node = nodes.get(name)
    if node is None:
        raise HTTPException(status_code=422, detail=f"Unknown node name {name}")
    return node


def get_graph(
    name: str,
    graphs: Annotated[Mapping[str, QualibrationGraph], Depends(get_graphs)],
) -> QualibrationGraph:
    graph = graphs.get(name)
    if graph is None:
        raise HTTPException(
            status_code=422, detail=f"Unknown graph name {name}"
        )
    return graph
