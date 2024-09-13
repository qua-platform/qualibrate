from pydantic import BaseModel


class WorkflowStatus(BaseModel):
    active: bool
    nodes_completed: int
    nodes_total: int
    run_duration: float
