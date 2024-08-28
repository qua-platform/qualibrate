from pydantic import BaseModel


class WorkflowStatus(BaseModel):
    active: bool
    nodes_completed: int
    run_duration: float
