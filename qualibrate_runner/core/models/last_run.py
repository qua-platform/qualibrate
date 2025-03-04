from collections.abc import Mapping
from datetime import datetime
from enum import Enum
from typing import Annotated, Any, Optional, Union

from pydantic import AwareDatetime, BaseModel, Field, computed_field
from qualibrate.models.run_summary.graph import GraphRunSummary
from qualibrate.models.run_summary.node import NodeRunSummary


class RunStatus(Enum):
    """Enum representing the status of a run."""

    RUNNING = "running"
    FINISHED = "finished"
    ERROR = "error"


class RunnableType(Enum):
    """Enum representing the type of runnable entity."""

    NODE = "node"
    GRAPH = "graph"


class RunError(BaseModel):
    """Model representing an error encountered during execution."""

    error_class: str = Field(..., description="The class of the error.")
    message: str = Field(..., description="The error message.")
    traceback: list[str] = Field(..., description="The traceback of the error.")


class StateUpdate(BaseModel):
    key: str
    attr: Union[str, int]
    old: Any
    new: Any
    updated: bool = False


class LastRun(BaseModel):
    """Model representing the last executed run."""

    status: Annotated[
        RunStatus,
        Field(
            description=(
                "The status of the run. "
                f"Possible options: {tuple(v.value for v in RunStatus)}."
            ),
        ),
    ]
    started_at: Annotated[
        AwareDatetime, Field(..., description="The start time of the run.")
    ]
    completed_at: Annotated[
        Optional[AwareDatetime],
        Field(description="The completion time of the run."),
    ] = None
    name: Annotated[str, Field(description="The name of the run.")]
    idx: Annotated[int, Field(..., description="The index of the run.")]
    runnable_type: Annotated[
        RunnableType,
        Field(
            description=(
                "The type of the runnable entity."
                f"Possible options: {tuple(v.value for v in RunnableType)}."
            ),
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
        Optional[Union[NodeRunSummary, GraphRunSummary]],
        Field(
            description=(
                "The result of the run. Can be result of node or graph."
            ),
        ),
    ] = None
    # Here is not using Annotated because of mypy issue.
    # It doesn't understand default factory as default value so expect
    # argument on init
    state_updates: Union[
        Mapping[str, StateUpdate], Mapping[str, Mapping[str, StateUpdate]]
    ] = Field(
        default_factory=lambda: dict(),
        description="The state updates during the run.",
    )
    error: Annotated[
        Optional[RunError],
        Field(description="Any error encountered during the run."),
    ] = None

    @computed_field(description="Duration of the run in seconds.")
    def run_duration(self) -> float:
        duration = (
            self.completed_at - self.started_at
            if self.completed_at is not None
            else datetime.now().astimezone() - self.started_at
        )
        return round(duration.total_seconds(), 3)
