from datetime import datetime
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from qualibrate_config.models import QualibrateConfig

from qualibrate_runner.api.dependencies import get_state
from qualibrate_runner.config import State
from qualibrate_runner.config.resolvers import get_cl_settings, get_settings
from qualibrate_runner.core.models.enums import RunStatusEnum
from qualibrate_runner.core.models.last_run import LastRun
from qualibrate_runner.core.models.runner_meta import RunnerMeta
from qualibrate_runner.utils.logs_parser import (
    get_logs_from_qualibrate_files,
    get_logs_from_qualibrate_in_memory_storage,
)

others_router = APIRouter()


@others_router.get("/meta")
def get_meta() -> RunnerMeta:
    return RunnerMeta()


@others_router.get("/is_running", deprecated=True)
def check_running(
    state: Annotated[State, Depends(get_state)],
) -> bool:
    """Whether is there any running (active) item (node or graph)"""
    return state.is_running


@others_router.get("/output_logs")
def get_output_logs(
    after: datetime | None = None,
    before: datetime | None = None,
    num_entries: int = 100,
    parse_files: bool = False,
    reverse: bool = False,
    *,
    config: Annotated[QualibrateConfig, Depends(get_settings)],
) -> list[dict[str, Any]]:
    """
    Return core logs within specified time range but
    with amount not greater than `num_entries`
    """
    logs_getter = (
        get_logs_from_qualibrate_files
        if parse_files
        else get_logs_from_qualibrate_in_memory_storage
    )
    logs = logs_getter(
        after=after,
        before=before,
        num_entries=num_entries,
        config=config,
    )
    if reverse:
        return list(reversed(logs))
    return logs


@others_router.post(
    "/stop",
    description="Stop a currently running workflow or node.",
    response_description=(
        "True if a running item was stopped successfully, False otherwise."
    ),
)
def stop_running(
    state: Annotated[State, Depends(get_state)],
    stop_graph_node: Annotated[
        bool,
        Query(description="Whether to stop the entire graph node execution."),
    ] = False,
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
) -> LastRun | None:
    if (
        state.last_run is None
        or state.last_run.status != RunStatusEnum.FINISHED
    ):
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


@others_router.post("/refresh_settings")
def refresh_settings(
    state: Annotated[State, Depends(get_state)],
) -> None:
    state.clear()
    get_settings.cache_clear()
    get_cl_settings.cache_clear()
