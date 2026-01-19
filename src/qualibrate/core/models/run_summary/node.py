from qualibrate.core.parameters import NodeParameters
from qualibrate.core.models.run_summary.base import BaseRunSummary

__all__ = ["NodeRunSummary"]


class NodeRunSummary(BaseRunSummary):
    snapshot_idx: int | None = None
    parameters: NodeParameters
