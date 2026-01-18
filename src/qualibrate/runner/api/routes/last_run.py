from typing import Annotated

from fastapi import APIRouter, Depends
from qualibrate import QualibrationGraph
from qualibrate.models.execution_history import ExecutionHistory

from qualibrate_runner.api.dependencies import get_state
from qualibrate_runner.api.utils import get_model_docstring
from qualibrate_runner.config import State
from qualibrate_runner.core.models.active_run import RunStatus
from qualibrate_runner.core.models.enums import RunStatusEnum
from qualibrate_runner.core.models.last_run import LastRun
from qualibrate_runner.core.models.workflow import WorkflowStatus
from qualibrate_runner.core.statuses import (
    get_graph_execution_history,
    get_run_status,
)
from qualibrate_runner.core.types import QGraphType

last_run_router = APIRouter(prefix="/last_run")


@last_run_router.get(
    "/",
    description="""
Returns the currently active element (node or graph). 
If there is no active element, then returns the last executed one.
Check fields below.

**Note**:

Available only in runtime. Reset on server restart.
""",
    response_description=f"""
The last run if available, `None` otherwise.

{get_model_docstring(LastRun)}
""",
    deprecated=True,
)
def get_last_run(
    state: Annotated[State, Depends(get_state)],
) -> LastRun | None:
    return state.last_run


@last_run_router.get(
    "/status",
    description="Status of active graph and node",
    response_description=f"""
Node and workflow status if active/last run item is available, `None` otherwise.

{get_model_docstring(RunStatus)}
""",
)
def get_status(
    state: Annotated[State, Depends(get_state)],
) -> RunStatus:
    return get_run_status(state)


@last_run_router.get(
    "/workflow/status",
    description="""Retrieve the status of workflow.""",
    response_description=f"""
Workflow status if active/last run item is workflow, `None` otherwise.

{get_model_docstring(WorkflowStatus)}
""",
    deprecated=True,
)
def get_workflow_status(
    state: Annotated[State, Depends(get_state)],
) -> WorkflowStatus | None:
    if not isinstance(state.run_item, QualibrationGraph):
        return None
    graph: QGraphType = state.run_item
    last_run = state.last_run
    run_duration = float(
        last_run.run_duration if last_run else 0.0  # type: ignore
    )
    return WorkflowStatus(
        status=last_run.status if last_run else RunStatusEnum.FINISHED,
        active=state.is_running,
        active_node_name=graph.active_node_name,
        nodes_completed=graph.completed_count(),
        nodes_total=len(graph._nodes),
        run_duration=run_duration,
        error=last_run.error if last_run else None,
    )


@last_run_router.get("/workflow/execution_history")
def get_execution_history(
    state: Annotated[State, Depends(get_state)],
    reverse: bool = False,
) -> ExecutionHistory | None:
    return get_graph_execution_history(state, reverse)
