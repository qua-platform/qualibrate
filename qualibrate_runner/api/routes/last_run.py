from typing import Annotated, Any, Mapping, Optional, cast

from fastapi import APIRouter, Depends
from qualibrate.orchestration.execution_history import ExecutionHistory
from qualibrate.qualibration_graph import QualibrationGraph

from qualibrate_runner.api.dependencies import get_state
from qualibrate_runner.config import State
from qualibrate_runner.core.models.last_run import LastRun
from qualibrate_runner.core.models.workflow import WorkflowStatus

last_run_router = APIRouter(prefix="/last_run")


@last_run_router.get("/")
def get_last_run(
    state: Annotated[State, Depends(get_state)],
) -> Optional[LastRun]:
    return state.last_run


@last_run_router.get("/workflow/status")
def get_workflow_status(
    state: Annotated[State, Depends(get_state)],
) -> Optional[WorkflowStatus]:
    if not isinstance(state.run_item, QualibrationGraph):
        return None
    graph: QualibrationGraph = state.run_item
    run_duration = float(
        state.last_run.run_duration  # type: ignore
        if state.last_run
        else 0.0
    )
    return WorkflowStatus(
        active=state.is_running,
        nodes_completed=graph.completed_count(),
        run_duration=run_duration,
    )


@last_run_router.get("/workflow/execution_history")
def get_execution_history(
    state: Annotated[State, Depends(get_state)],
    reverse: bool = False,
) -> Optional[Mapping[str, Any]]:
    if not isinstance(state.run_item, QualibrationGraph):
        return None
    graph: QualibrationGraph = state.run_item
    orch = graph._orchestrator
    if orch is None:
        raise RuntimeError("No graph orchestrator")
    history: ExecutionHistory = orch.get_execution_history()
    if reverse:
        history.items = list(reversed(history.items))
    return cast(
        Mapping[str, Any],
        history.model_dump(mode="json", serialize_as_any=True),
    )
