from typing import Annotated, Optional

from fastapi import APIRouter, Depends
from qualibrate import QualibrationGraph, QualibrationNode
from qualibrate.models.execution_history import ExecutionHistory

from qualibrate_runner.api.dependencies import get_state
from qualibrate_runner.api.utils import get_model_docstring
from qualibrate_runner.config import State
from qualibrate_runner.core.models.active_run import (
    RunStatus,
    RunStatusGraph,
    RunStatusNode,
)
from qualibrate_runner.core.models.enums import RunStatusEnum
from qualibrate_runner.core.models.last_run import LastRun
from qualibrate_runner.core.models.workflow import WorkflowStatus
from qualibrate_runner.core.types import QGraphType, QNodeType

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
)
def get_last_run(
    state: Annotated[State, Depends(get_state)],
) -> Optional[LastRun]:
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
) -> Optional[RunStatus]:
    if state.last_run is None:
        return RunStatus()
    if isinstance(state.run_item, QualibrationNode):
        node: Optional[QNodeType] = state.run_item
        graph: Optional[QGraphType] = None
    elif isinstance(state.run_item, QualibrationGraph):
        graph = state.run_item
        node = (
            graph._orchestrator.active_node
            if graph._orchestrator is not None
            else None
        )
    else:
        node = None
        graph = None

    node_status: Optional[RunStatusNode] = None
    graph_status: Optional[RunStatusGraph] = None
    if node:
        status = (
            state.last_run.status if graph is None else RunStatusEnum.RUNNING
        )

        node_status = RunStatusNode(
            name=node.name,
            id=node.snapshot_idx or state.last_run.idx,
            status=status,
            run_start=node.run_start,
            run_end=state.last_run.completed_at,
            percentage_complete=node.fraction_complete * 100,
        )
    if graph:
        graph_status = RunStatusGraph(
            name=graph.name,
            run_start=graph.run_start,
            run_end=state.last_run.completed_at,
            status=state.last_run.status,
            finished_nodes=graph.completed_count(),
            total_nodes=len(graph._nodes),
        )
        if node is None and (orchestrator := graph._orchestrator):
            execution_history = orchestrator.get_execution_history().items
            if len(execution_history):
                node_hist = execution_history[-1]
                node_status = RunStatusNode(
                    name=node_hist.metadata.name,
                    id=node_hist.id,
                    status=RunStatusEnum.FINISHED,
                    run_start=node_hist.metadata.run_start,
                    run_end=node_hist.metadata.run_end,
                    percentage_complete=100,
                )
    return RunStatus(node=node_status, graph=graph_status)


@last_run_router.get(
    "/workflow/status",
    description="""Retrieve the status of workflow.""",
    response_description=f"""
Workflow status if active/last run item is workflow, `None` otherwise.

{get_model_docstring(WorkflowStatus)}
""",
)
def get_workflow_status(
    state: Annotated[State, Depends(get_state)],
) -> Optional[WorkflowStatus]:
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
        # TODO: remove type ignore
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
) -> Optional[ExecutionHistory]:
    if not isinstance(state.run_item, QualibrationGraph):
        return None
    graph: QGraphType = state.run_item
    orch = graph._orchestrator
    if orch is None:
        raise RuntimeError("No graph orchestrator")
    history: ExecutionHistory = orch.get_execution_history()
    if reverse:
        history.items = list(reversed(history.items))
    return history
