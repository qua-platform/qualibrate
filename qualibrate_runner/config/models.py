"""
Global state tracking for the qualibrate runner.

This module defines the State model, which tracks the currently executing
calibration job and its status. The State is used by:
- The web UI to display real-time execution status
- The API to report job progress
- Monitoring systems to track calibration workflows

The State is a singleton-like object (one per runner instance) that is
continuously updated as jobs execute.
"""

from pydantic import BaseModel, ConfigDict

from qualibrate_runner.core.models.enums import RunStatusEnum
from qualibrate_runner.core.models.last_run import LastRun
from qualibrate_runner.core.types import QGraphType, QNodeType


class State(BaseModel):
    """
    Tracks the current and last executed calibration job.

    This model serves as the single source of truth for the runner's execution
    state. It is continuously updated by run_job.run_node() and
    run_job.run_workflow() as jobs execute.

    The State is designed to be serializable (via Pydantic) so it can be
    exposed through APIs for monitoring and UI purposes.

    Attributes:
        last_run: Complete information about the most recent execution,
            including status, timing, results, and errors. None if no job
            has been executed yet.
        run_item: Reference to the actual QualibrationNode or Graph being
            executed. This allows access to the live object during execution.
            None when no job is running.
    """

    model_config = ConfigDict(arbitrary_types_allowed=True)

    last_run: LastRun | None = None
    run_item: QNodeType | QGraphType | None = None

    @property
    def is_running(self) -> bool:
        return (
            self.last_run is not None
            and self.last_run.status == RunStatusEnum.RUNNING
        )

    def clear(self) -> None:
        """
        Clear the state, removing all execution history.

        This resets both last_run and run_item to None, effectively clearing
        all execution state. Used to start fresh or clean up after errors.

        Raises:
            RuntimeError: If called while a job is currently running (status
                is RUNNING). You must wait for the job to complete or error
                before clearing state.
        """
        if (
            self.last_run is not None
            and self.last_run.status == RunStatusEnum.RUNNING
        ):
            raise RuntimeError("Can't clear while item is running")
        self.last_run = None
        self.run_item = None
