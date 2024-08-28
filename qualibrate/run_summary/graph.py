from qualibrate import ExecutionParameters
from qualibrate.run_summary.base import BaseRunSummary

__all__ = ["GraphRunSummary"]


class GraphRunSummary(BaseRunSummary):
    parameters: ExecutionParameters
