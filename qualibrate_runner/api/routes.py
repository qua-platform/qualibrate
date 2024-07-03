from typing import Annotated, Any, Mapping, Optional, Type, cast

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from pydantic import BaseModel
from qualibrate.qualibration_node import QualibrationNode

from qualibrate_runner.api.dependencies import (
    get_library,
    get_state,
)
from qualibrate_runner.api.dependencies import (
    get_node as get_qnode,
)
from qualibrate_runner.api.dependencies import (
    get_nodes as get_qnodes,
)
from qualibrate_runner.config import (
    QualibrateRunnerSettings,
    State,
    get_settings,
)
from qualibrate_runner.core.models.last_run import LastRun, RunStatus
from qualibrate_runner.core.run_job import run_job, validate_input_parameters

base_router = APIRouter()


@base_router.get("/is_running")
def check_running(
    state: Annotated[State, Depends(get_state)],
) -> bool:
    return state.is_running


@base_router.post("/submit")
def submit_run(
    input_parameters: Mapping[str, Any],
    state: Annotated[State, Depends(get_state)],
    node: Annotated[Any, Depends(get_qnode)],
    background_tasks: BackgroundTasks,
) -> str:
    if state.is_running:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Already running",
        )
    # TODO: use `Calibration_node.validate_parameters`
    validate_input_parameters(
        cast(Type[BaseModel], node.parameters_class), input_parameters
    )
    background_tasks.add_task(run_job, node, input_parameters, state)
    return f"Job {node.name} submitted"


@base_router.get("/get_nodes")
def get_nodes(
    nodes: Annotated[Mapping[str, Any], Depends(get_qnodes)],
    settings: Annotated[QualibrateRunnerSettings, Depends(get_settings)],
    rescan: bool = False,
) -> Mapping[str, Any]:
    if rescan:
        get_library.cache_clear()
        get_qnodes.cache_clear()
        library = get_library(settings)
        nodes = get_qnodes(library)
    return {node_name: node.serialize() for node_name, node in nodes.items()}


@base_router.get("/get_node")
def get_node(
    node: Annotated[QualibrationNode, Depends(get_qnode)],
) -> Mapping[str, Any]:
    return cast(Mapping[str, Any], node.serialize())


@base_router.get("/last_run")
def get_last_run(
    state: Annotated[State, Depends(get_state)],
) -> Optional[LastRun]:
    return state.last_run


@base_router.post(
    "/record_state_update",
    description=(
        "Record that a state update entry belonging to the last run has been "
        "updated. This changed the state_updates entry to True  but does not "
        "update the snapshot."
    ),
)
def state_updated(
    state: Annotated[State, Depends(get_state)],
    key: str,
) -> Optional[LastRun]:
    if state.last_run is None or state.last_run.status != RunStatus.FINISHED:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Node not executed or finished unsuccessful.",
        )
    state_updates = state.last_run.state_updates
    if key not in state_updates:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Unknown state update key.",
        )
    state_updates[key].updated = True
    return state.last_run
