from qualibrate.core.models.run_summary.base import BaseRunSummary
from qualibrate.core.parameters import NodeParameters

__all__ = ["NodeRunSummary"]


class NodeRunSummary(BaseRunSummary):
    snapshot_idx: int | None = None
    parameters: NodeParameters
