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
    run_status = RunStatus.RUNNING
    state.last_run = LastRun(
        name=node.name,
        status=RunStatus.RUNNING,
        idx=-1,
        passed_parameters=passed_input_parameters,
        started_at=datetime.now(),
        runnable_type=RunnableType.NODE,
    )
    idx = -1
    run_error = None
    try:
        node.run(passed_parameters=passed_input_parameters)
        node = QualibrationNode.last_executed_node
    except Exception as ex:
        run_status = RunStatus.ERROR
        run_error = RunError(
            error_class=ex.__class__.__name__,
            message=str(ex),
            traceback=traceback.format_tb(ex.__traceback__),
        )
        run_status = RunStatus.ERROR
        raise
    else:
        idx = node.snapshot_idx if hasattr(node, "snapshot_idx") else -1
        idx = idx if idx is not None else -1
        run_status = RunStatus.FINISHED
    finally:
        state.last_run = LastRun(
            name=state.last_run.name,
            status=run_status,
            idx=idx,
            run_result=node.run_summary,
            runnable_type=state.last_run.runnable_type,
            passed_parameters=passed_input_parameters,
            started_at=state.last_run.started_at,
            completed_at=datetime.now(),
            state_updates=node.state_updates,
            error=run_error,
        )


def run_workflow(
    workflow: QualibrationGraph,
    passed_input_parameters: Mapping[str, Any],
    state: State,
) -> None:
    run_status = RunStatus.RUNNING
    state.last_run = LastRun(
        name=workflow.name,
        status=run_status,
        idx=-1,
        started_at=datetime.now(),
        runnable_type=RunnableType.GRAPH,
        passed_parameters=passed_input_parameters,
    )
    state.run_item = workflow
    idx = -1
    run_error = None
    try:
        library = get_active_library_or_error()
        workflow = library.graphs[workflow.name]
        input_parameters = workflow.full_parameters_class(
            **passed_input_parameters
        )
        workflow.run(
            nodes=input_parameters.nodes.model_dump(),
            **input_parameters.parameters.model_dump(),
        )
    except Exception as ex:
        run_status = RunStatus.ERROR
        run_error = RunError(
            error_class=ex.__class__.__name__,
            message=str(ex),
            traceback=traceback.format_tb(ex.__traceback__),
        )
        raise
    else:
        idx = workflow.snapshot_idx if hasattr(workflow, "snapshot_idx") else -1
        idx = idx if idx is not None else -1
        run_status = RunStatus.FINISHED
    finally:
        state.last_run = LastRun(
            name=state.last_run.name,
            status=run_status,
            idx=idx,
            run_result=workflow.run_summary,
            started_at=state.last_run.started_at,
            completed_at=datetime.now(),
            runnable_type=state.last_run.runnable_type,
            passed_parameters=passed_input_parameters,
            state_updates=(
                workflow.state_updates
                if hasattr(workflow, "state_updates")
                else {}
            ),
            error=run_error,
        )
