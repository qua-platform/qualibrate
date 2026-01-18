from qualibrate import ExecutionParameters
from qualibrate.models.run_summary.base import BaseRunSummary

__all__ = ["GraphRunSummary"]


class GraphRunSummary(BaseRunSummary):
    parameters: ExecutionParameters | None = None
