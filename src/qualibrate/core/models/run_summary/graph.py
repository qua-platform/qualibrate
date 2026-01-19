from qualibrate.core.parameters import ExecutionParameters
from qualibrate.core.models.run_summary.base import BaseRunSummary

__all__ = ["GraphRunSummary"]


class GraphRunSummary(BaseRunSummary):
    parameters: ExecutionParameters | None = None
