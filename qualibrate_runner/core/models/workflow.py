from typing import Annotated, Optional

from pydantic import BaseModel, Field

from qualibrate_runner.core.models.last_run import RunError, RunStatus


class WorkflowStatus(BaseModel):
    """Model representing the status of a workflow execution."""

    active: Annotated[
        bool,
        Field(description="Indicates if the workflow is currently running."),
    ]
    status: Annotated[
        RunStatus, Field(description="The current status of the workflow.")
    ]
    active_node_name: Annotated[
        Optional[str],
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
        Optional[RunError],
        Field(
            description=(
                "Any error encountered during the workflow execution, "
                "if applicable."
            ),
        ),
    ] = None
