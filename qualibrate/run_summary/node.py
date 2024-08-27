from typing import Optional

from qualibrate import NodeParameters
from qualibrate.run_summary.base import BaseRunSummary

__all__ = ["NodeParameters"]


class NodeRunSummary(BaseRunSummary):
    snapshot_idx: Optional[int] = None
    parameters: NodeParameters
