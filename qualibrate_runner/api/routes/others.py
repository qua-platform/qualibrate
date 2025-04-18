from datetime import datetime
from functools import partial
from itertools import islice
from pathlib import Path
from typing import Annotated, Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from qualibrate_config.models import QualibrateConfig

from qualibrate_runner.api.dependencies import get_state
from qualibrate_runner.config import State
from qualibrate_runner.config.resolvers import get_settings
from qualibrate_runner.core.models.enums import RunStatusEnum
from qualibrate_runner.core.models.last_run import LastRun
from qualibrate_runner.utils.logs_parser import (
    filter_log_date,
    parse_log_line_with_previous,
)

others_router = APIRouter()


@others_router.get("/is_running")
def check_running(
    state: Annotated[State, Depends(get_state)],
) -> bool:
    """Whether is there any running (active) item (node or graph)"""
    return state.is_running


@others_router.get("/output_logs")
def get_output_logs(
    after: Optional[datetime] = None,
    before: Optional[datetime] = None,
    num_entries: int = 100,
    *,
    config: Annotated[QualibrateConfig, Depends(get_settings)],
) -> list[dict[str, Any]]:
    """
    Return core logs within specified time range but
    with amount not greater than `num_entries`
    """
    log_folder = config.log_folder
    if log_folder is None:
        return []
    out_logs: list[dict[str, Any]] = []
    q_log_files = filter(Path.is_file, log_folder.iterdir())
    filter_log_date_range = partial(filter_log_date, after=after, before=before)
    for log_file in sorted(q_log_files):
        with open(log_file) as f:
            filtered = list(
                filter(filter_log_date_range, parse_log_line_with_previous(f))
            )
            lines_date_filtered = reversed(filtered)
            file_logs = islice(lines_date_filtered, num_entries - len(out_logs))
            out_logs.extend(file_logs)
            if len(out_logs) == num_entries:
                return list(reversed(out_logs))
    return list(reversed(out_logs))


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
) -> Optional[LastRun]:
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
