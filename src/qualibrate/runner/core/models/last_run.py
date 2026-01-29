"""
Execution tracking model for calibration jobs.

This module defines the LastRun model, which captures information about
a single execution of a node or workflow. It includes:
- Execution status and timing
- Input parameters and results
- Error information if the execution failed
- State updates (changes to QuAM quantum machine state)

The LastRun is updated by run_job.run_node() and run_job.run_workflow()
throughout the execution lifecycle (RUNNING -> FINISHED/ERROR).
"""

from collections.abc import Mapping
from datetime import datetime
from typing import Annotated, Any

from pydantic import AwareDatetime, BaseModel, Field, computed_field

from qualibrate.core.models.run_summary.graph import GraphRunSummary
from qualibrate.core.models.run_summary.node import NodeRunSummary
from qualibrate.runner.core.models.common import RunError, StateUpdate
from qualibrate.runner.core.models.enums import RunnableType, RunStatusEnum

__all__ = ["LastRun"]


class LastRun(BaseModel):
    """
    Execution record for a calibration node or workflow.

    This model captures info about a single execution, from start to
    completion (or error). It's designed to be updated twice:
    1. Initially: when execution starts (RUNNING status, start time)
    2. Finally: when execution completes (FINISHED/ERROR status, results/error)

    The model supports serialization to JSON for API responses and storage.
    """

    # Execution status can be RUNNING, FINISHED, or ERROR
    status: Annotated[
        RunStatusEnum,
        Field(
            description=(f"The status of the run. Possible options: {tuple(v.value for v in RunStatusEnum)}."),
        ),
    ]
    started_at: Annotated[AwareDatetime, Field(..., description="The start time of the run.")]
    completed_at: Annotated[
        AwareDatetime | None,
        Field(description="The completion time of the run."),
    ] = None
    name: Annotated[str, Field(description="The name of the run.")]
    idx: Annotated[int, Field(..., description="The index of the run.")]
    runnable_type: Annotated[
        RunnableType,
        Field(
            description=(f"The type of the runnable entity.Possible options: {tuple(v.value for v in RunnableType)}."),
        ),
    ]
    passed_parameters: Annotated[
        Mapping[str, Any],
        Field(
            default_factory=lambda: dict(),
            description="The parameters passed to the run.",
        ),
    ]
    run_result: Annotated[
        NodeRunSummary | GraphRunSummary | None,
        Field(
            description=("The result of the run. Can be result of node or graph."),
        ),
    ] = None
    # Here is not using Annotated because of mypy issue.
    # It doesn't understand default factory as default value so expect
    # argument on init
    state_updates: Mapping[str, StateUpdate] = Field(
        default_factory=dict,
        description="The state updates during the run.",
    )
    error: Annotated[
        RunError | None,
        Field(description="Any error encountered during the run."),
    ] = None

    @computed_field(description="Duration of the run in seconds.")
    def run_duration(self) -> float:  # Unit: seconds
        duration = (
            self.completed_at - self.started_at
            if self.completed_at is not None
            else datetime.now().astimezone() - self.started_at
        )
        return round(duration.total_seconds(), 3)
