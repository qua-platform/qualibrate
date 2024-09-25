from typing import Optional

from qualibrate import NodeParameters
from qualibrate.models.run_summary.base import BaseRunSummary

__all__ = ["NodeRunSummary"]


class NodeRunSummary(BaseRunSummary):
    snapshot_idx: Optional[int] = None
    parameters: NodeParameters
