import traceback
from collections.abc import Mapping
from datetime import datetime
from typing import Any, cast

from fastapi import HTTPException, status
from pydantic import BaseModel, ValidationError
from qualibrate.models.run_summary.graph import GraphRunSummary
from qualibrate.models.run_summary.node import NodeRunSummary
from qualibrate.qualibration_library import QualibrationLibrary

from qualibrate_runner.config import State
from qualibrate_runner.core.models.common import RunError
from qualibrate_runner.core.models.enums import RunnableType, RunStatusEnum
from qualibrate_runner.core.models.last_run import LastRun
from qualibrate_runner.core.types import QGraphType, QLibraryType, QNodeType


def validate_input_parameters(
    parameters_class: type[BaseModel],
    passed_parameters: Mapping[str, Any],
) -> BaseModel:
    try:
        return parameters_class.model_validate(passed_parameters)
    except ValidationError as ex:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=ex.errors()
        ) from ex


def get_active_library_or_error() -> QLibraryType:
    return QualibrationLibrary.get_active_library(create=False)


def run_node(
    node: QNodeType,
    passed_input_parameters: Mapping[str, Any],
    state: State,
) -> None:
    state.run_item = node
    run_status = RunStatusEnum.RUNNING
    state.last_run = LastRun(
        name=node.name,
        status=RunStatusEnum.RUNNING,
        idx=-1,
        passed_parameters=passed_input_parameters,
        started_at=datetime.now().astimezone(),
        runnable_type=RunnableType.NODE,
    )
    idx = -1
    run_error = None
    try:
        node.run(interactive=True, **passed_input_parameters)
    except Exception as ex:
        run_status = RunStatusEnum.ERROR
        run_error = RunError(
            error_class=ex.__class__.__name__,
            message=str(ex),
            traceback=traceback.format_tb(ex.__traceback__),
        )
        raise
    else:
        _idx = node.snapshot_idx if hasattr(node, "snapshot_idx") else -1
        idx = _idx if _idx is not None else -1
        run_status = RunStatusEnum.FINISHED
    finally:
        state.last_run = LastRun(
            name=state.last_run.name,
            status=run_status,
            idx=idx,
            # TODO: Make run summary generic
            run_result=cast(NodeRunSummary | None, node.run_summary),
            runnable_type=state.last_run.runnable_type,
            passed_parameters=passed_input_parameters,
            started_at=state.last_run.started_at,
            completed_at=datetime.now().astimezone(),
            state_updates=node.state_updates,
            error=run_error,
        )


def run_workflow(
    workflow: QGraphType,
    passed_input_parameters: Mapping[str, Any],
    state: State,
) -> None:
    run_status = RunStatusEnum.RUNNING
    state.last_run = LastRun(
        name=workflow.name,
        status=run_status,
        idx=-1,
        started_at=datetime.now().astimezone(),
        runnable_type=RunnableType.GRAPH,
        passed_parameters=passed_input_parameters,
    )
    idx = -1
    run_error = None
    try:
        library = get_active_library_or_error()
        workflow = library.graphs[workflow.name]  # copied graph instance
        state.run_item = workflow
        input_parameters = workflow.full_parameters_class(
            **passed_input_parameters
        )
        workflow.run(
            nodes=input_parameters.nodes.model_dump(),
            **input_parameters.parameters.model_dump(),
        )
    except Exception as ex:
        run_status = RunStatusEnum.ERROR
        run_error = RunError(
            error_class=ex.__class__.__name__,
            message=str(ex),
            traceback=traceback.format_tb(ex.__traceback__),
        )
        raise
    else:
        idx = workflow.snapshot_idx if hasattr(workflow, "snapshot_idx") else -1
        idx = idx if idx is not None else -1
        run_status = RunStatusEnum.FINISHED
    finally:
        state.last_run = LastRun(
            name=state.last_run.name,
            status=run_status,
            idx=idx,
            run_result=cast(GraphRunSummary | None, workflow.run_summary),
            started_at=state.last_run.started_at,
            completed_at=datetime.now().astimezone(),
            runnable_type=state.last_run.runnable_type,
            passed_parameters=passed_input_parameters,
            error=run_error,
        )
