from pydantic import BaseModel, ConfigDict

from qualibrate_runner.core.models.enums import RunStatusEnum
from qualibrate_runner.core.models.last_run import LastRun
from qualibrate_runner.core.types import QGraphType, QNodeType


class State(BaseModel):
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
        if (
            self.last_run is not None
            and self.last_run.status == RunStatusEnum.RUNNING
        ):
            raise RuntimeError("Can't clear while item is running")
        self.last_run = None
        self.run_item = None
