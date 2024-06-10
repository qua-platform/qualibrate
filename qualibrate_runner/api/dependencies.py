from functools import cache
from typing import Annotated, Mapping

from fastapi import Depends, HTTPException
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
def get_nodes(
    settings: Annotated[QualibrateRunnerSettings, Depends(get_settings)],
) -> Mapping[str, QualibrationNode]:
    return settings.calibration_nodes_resolver()


def get_node(
    name: str,
    nodes: Annotated[Mapping[str, QualibrationNode], Depends(get_nodes)],
) -> QualibrationNode:
    node = nodes.get(name)
    if node is None:
        raise HTTPException(status_code=422, detail=f"Unknown node name {name}")
    return node
