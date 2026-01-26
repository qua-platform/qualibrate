from qualibrate.core.models.run_summary.base import BaseRunSummary
from qualibrate.core.parameters import ExecutionParameters

__all__ = ["GraphRunSummary"]


class GraphRunSummary(BaseRunSummary):
    parameters: ExecutionParameters | None = None
