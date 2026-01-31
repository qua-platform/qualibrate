from enum import Enum

__all__ = ["ExecutionType"]


class ExecutionType(str, Enum):
    """Type of execution for a snapshot.

    Attributes:
        node: A single calibration node execution.
        workflow: A workflow/graph execution containing multiple nodes.
    """

    node = "node"
    workflow = "workflow"
