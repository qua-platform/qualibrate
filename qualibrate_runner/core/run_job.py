import traceback
from datetime import datetime
from typing import Any, Mapping, Type

from fastapi import HTTPException, status
from pydantic import BaseModel, ValidationError
from qualibrate.qualibration_graph import QualibrationGraph
from qualibrate.qualibration_library import QualibrationLibrary
from qualibrate.qualibration_node import QualibrationNode

from qualibrate_runner.config import State
from qualibrate_runner.core.models.last_run import (
    LastRun,
    RunError,
    RunnableType,
    RunStatus,
)


def validate_input_parameters(
    parameters_class: Type[BaseModel],
    passed_parameters: Mapping[str, Any],
) -> BaseModel:
    try:
        return parameters_class.model_validate(passed_parameters)
    except ValidationError as ex:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=ex.errors()
        )


def get_active_library_or_error() -> QualibrationLibrary:
    if QualibrationLibrary.active_library is None:
        raise RuntimeError("Qualibration library is not exist")
    return QualibrationLibrary.active_library


def run_node(
    node: QualibrationNode,
    passed_input_parameters: Mapping[str, Any],
    state: State,
) -> None:
    state.run_item = node
    state.last_run = LastRun(
        name=node.name,
        status=RunStatus.RUNNING,
        idx=-1,
        passed_parameters=passed_input_parameters,
        started_at=datetime.now(),
        runnable_type=RunnableType.NODE,
    )
    try:
        library = get_active_library_or_error()
        node = library.nodes[node.name]
        result = library.run_node(
            node.name, node.parameters_class(**passed_input_parameters)
        )
    except Exception as ex:
        state.last_run = LastRun(
            name=state.last_run.name,
            status=RunStatus.ERROR,
            idx=-1,
            started_at=state.last_run.started_at,
            completed_at=datetime.now(),
            runnable_type=state.last_run.runnable_type,
            error=RunError(
                error_class=ex.__class__.__name__,
                message=str(ex),
                traceback=traceback.format_tb(ex.__traceback__),
            ),
        )
        raise
    else:
        idx = node.snapshot_idx if hasattr(node, "snapshot_idx") else -1
        idx = idx if idx is not None else -1
        state.last_run = LastRun(
            name=state.last_run.name,
            status=RunStatus.FINISHED,
            idx=idx,
            run_result=result,
            runnable_type=state.last_run.runnable_type,
            started_at=state.last_run.started_at,
            completed_at=datetime.now(),
            state_updates=node.state_updates,
        )


def run_workflow(
    workflow: QualibrationGraph,
    passed_input_parameters: Mapping[str, Any],
    state: State,
) -> None:
    state.last_run = LastRun(
        name=workflow.name,
        status=RunStatus.RUNNING,
        idx=-1,
        started_at=datetime.now(),
        runnable_type=RunnableType.GRAPH,
        passed_parameters=passed_input_parameters
    )
    state.run_item = workflow
    try:
        library = get_active_library_or_error()
        workflow = library.graphs[workflow.name]
        result = library.run_graph(
            workflow.name,
            workflow.full_parameters_class(**passed_input_parameters),
        )
        print("Graph completed. Result:", result)
    except Exception as ex:
        state.last_run = LastRun(
            name=state.last_run.name,
            status=RunStatus.ERROR,
            idx=-1,
            started_at=state.last_run.started_at,
            completed_at=datetime.now(),
            runnable_type=state.last_run.runnable_type,
            error=RunError(
                error_class=ex.__class__.__name__,
                message=str(ex),
                traceback=traceback.format_tb(ex.__traceback__),
            ),
        )
        raise
    else:
        idx = workflow.snapshot_idx if hasattr(workflow, "snapshot_idx") else -1
        idx = idx if idx is not None else -1
        state.last_run = LastRun(
            name=state.last_run.name,
            status=RunStatus.FINISHED,
            idx=idx,
            run_result=result,
            started_at=state.last_run.started_at,
            completed_at=datetime.now(),
            runnable_type=state.last_run.runnable_type,
            state_updates=(
                workflow.state_updates
                if hasattr(workflow, "state_updates")
                else {}
            ),
        )
