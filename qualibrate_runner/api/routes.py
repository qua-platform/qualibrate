import time
from typing import Annotated, List

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException

from qualibrate_runner.api.dependencies import get_state
from qualibrate_runner.config import (
    QualibrateRunnerSettings,
    State,
    get_settings,
)

base_router = APIRouter()


def run_job(settings: State) -> None:
    try:
        settings.running = True
        time.sleep(5)
        settings.qmm = -1 if settings.qmm is None else settings.qmm + 1
        time.sleep(5)
    finally:
        settings.running = False


@base_router.get("/is_running")
def check_running(
    state: Annotated[State, Depends(get_state)],
) -> bool:
    return state.running


@base_router.post("/submit")
def submit_run(
    state: Annotated[State, Depends(get_state)],
    background_tasks: BackgroundTasks,
) -> str:
    if state.running:
        raise HTTPException(status_code=422, detail="Already running")
    background_tasks.add_task(run_job, state)
    return "Job submitted"


@base_router.get("/nodes")
def get_nodes(
    settings: Annotated[QualibrateRunnerSettings, Depends(get_settings)],
) -> List[str]:
    return settings.calibration_nodes_resolver()
