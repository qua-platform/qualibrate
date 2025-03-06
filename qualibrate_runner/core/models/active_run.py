from datetime import datetime, timedelta, timezone
from typing import Annotated, Optional

from pydantic import AwareDatetime, BaseModel, Field, computed_field

from qualibrate_runner.core.models.enums import RunStatusEnum

__all__ = ["RunStatus", "RunStatusNode", "RunStatusGraph"]


class RunStatusBase(BaseModel):
    name: str
    status: Annotated[
        RunStatusEnum,
        Field(
            description=(
                "The status of the node run. "
                f"Possible options: {tuple(v.value for v in RunStatusEnum)}."
            ),
        ),
    ]
    run_start: Annotated[
        AwareDatetime, Field(description="The start time of the run.")
    ]
    run_end: Annotated[
        Optional[AwareDatetime],
        Field(description="The completion time of the run."),
    ] = None

    @computed_field(description="Duration of the run in seconds.")
    def run_duration(self) -> float:
        duration = (
            self.run_end - self.run_start
            if self.run_end is not None
            else datetime.now().astimezone() - self.run_start
        )
        return round(duration.total_seconds(), 3)

    def _time_remaining(
        self, percentage_complete: float, run_start: AwareDatetime
    ) -> float:
        if percentage_complete == 0:
            return -1

        return round(
            (datetime.now(tz=timezone.utc) - run_start).total_seconds()
            * (100 - percentage_complete)
            / percentage_complete,
            3,
        )


class RunStatusNode(RunStatusBase):
    id: Optional[int] = None
    percentage_complete: Annotated[float, Field(ge=0, le=100)] = 0
    current_action: Optional[str] = None

    @computed_field
    def time_remaining(self) -> float:
        return self._time_remaining(self.percentage_complete, self.run_start)


class RunStatusGraph(RunStatusBase):
    total_nodes: int
    finished_nodes: int

    @computed_field(description="percentage_completed")
    def percentage_complete(self) -> float:
        return (self.finished_nodes / self.total_nodes) * 100

    @computed_field
    def time_remaining(self) -> float:
        return self._time_remaining(
            self.percentage_complete,  # type: ignore[arg-type]
            self.run_start,
        )


class RunStatus(BaseModel):
    node: Optional[RunStatusNode] = None
    graph: Optional[RunStatusGraph] = None


if __name__ == "__main__":
    print(
        RunStatusGraph(
            name="a",
            run_start=datetime.now(tz=timezone.utc) - timedelta(seconds=3),
            finished_nodes=1,
            total_nodes=3,
            status=RunStatusEnum.RUNNING,
        )
    )
