from typing import Any, Mapping, Type

from fastapi import HTTPException, status
from pydantic import BaseModel, ValidationError
from qualibrate.qualibration_library import QualibrationLibrary
from qualibrate.qualibration_node import QualibrationNode

from qualibrate_runner.config import State
from qualibrate_runner.core.models.last_run import LastRun, RunStatus


def validate_input_parameters(
    node_parameters: Type[BaseModel],
    passed_parameters: Mapping[str, Any],
) -> BaseModel:
    try:
        return node_parameters.model_validate(passed_parameters)
    except ValidationError as ex:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=ex.errors()
        )


def run_job(
    node: QualibrationNode,
    passed_input_parameters: Mapping[str, Any],
    state: State,
) -> None:
    state.passed_parameters = passed_input_parameters
    state.last_run = LastRun(
        name=node.name,
        status=RunStatus.RUNNING,
        idx=-1,
    )
    try:
        QualibrationLibrary.active_library.run_node(
            node.name,
            node.parameters_class(**passed_input_parameters),
        )
    except Exception:
        state.last_run.status = RunStatus.ERROR
        raise
    else:
        # node.run_summary() == {
        #   "status: "finished",
        #   "name": "my_calibration",
        #   "idx": 423,
        #   "state_updates": [...]
        # }
        state.last_run.status = RunStatus.FINISHED
        # TODO: assign `state_updates` and `idx`
        state.last_run.state_updates = []
