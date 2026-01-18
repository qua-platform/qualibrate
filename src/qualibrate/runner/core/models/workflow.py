from typing import Annotated

from pydantic import BaseModel, Field

from qualibrate_runner.core.models.common import RunError
from qualibrate_runner.core.models.enums import RunStatusEnum


class WorkflowStatus(BaseModel):
    """Model representing the status of a workflow execution."""

    active: Annotated[
        bool,
        Field(description="Indicates if the workflow is currently running."),
    ]
    status: Annotated[
        RunStatusEnum, Field(description="The current status of the workflow.")
    ]
    active_node_name: Annotated[
        str | None,
        Field(description="The name of the currently active node, if any."),
    ]
    nodes_completed: Annotated[
        int,
        Field(
            description=(
                "The number of nodes that have been completed in the workflow."
            ),
        ),
    ]
    nodes_total: Annotated[
        int, Field(description="The total number of nodes in the workflow.")
    ]
    run_duration: Annotated[
        float,
        Field(
            description=(
                "The total runtime duration of the workflow in seconds."
            ),
        ),
    ]
    error: Annotated[
        RunError | None,
        Field(
            description=(
                "Any error encountered during the workflow execution, "
                "if applicable."
            ),
        ),
    ] = None
