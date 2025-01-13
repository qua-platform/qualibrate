from typing import Optional, Union

from pydantic import BaseModel, ConfigDict

from qualibrate_runner.core.models.last_run import LastRun, RunStatus
from qualibrate_runner.core.types import QGraphType, QNodeType


class State(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    last_run: Optional[LastRun] = None
    run_item: Optional[Union[QNodeType, QGraphType]] = None

    @property
    def is_running(self) -> bool:
        return (
            self.last_run is not None
            and self.last_run.status == RunStatus.RUNNING
        )
