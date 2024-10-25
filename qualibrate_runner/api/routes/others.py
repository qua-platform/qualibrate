from collections.abc import Mapping
from typing import Annotated, Optional, cast

from fastapi import APIRouter, Depends, HTTPException, status

from qualibrate_runner.api.dependencies import (
    get_state,
)
from qualibrate_runner.config import (
    State,
)
from qualibrate_runner.core.models.last_run import (
    LastRun,
    RunStatus,
    StateUpdate,
)

others_router = APIRouter()


@others_router.get("/is_running")
def check_running(
    state: Annotated[State, Depends(get_state)],
) -> bool:
    return state.is_running


@others_router.post("/stop")
def stop_running(
    state: Annotated[State, Depends(get_state)],
    stop_graph_node: bool = False,
) -> bool:
    run_item = state.run_item
    if run_item is None:
        return False
    return bool(run_item.stop(stop_graph_node=stop_graph_node))


@others_router.post(
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
    state_updates = cast(Mapping[str, StateUpdate], state_updates)
    state_updates[key].updated = True
    return state.last_run
