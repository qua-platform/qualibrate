from typing import Optional

from qualibrate import ExecutionParameters
from qualibrate.models.run_summary.base import BaseRunSummary

__all__ = ["GraphRunSummary"]


class GraphRunSummary(BaseRunSummary):
    parameters: Optional[ExecutionParameters] = None
