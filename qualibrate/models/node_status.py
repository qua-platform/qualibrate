from enum import Enum

__all__ = ["NodeStatus"]


class NodeStatus(Enum):
    pending: str = "pending"
    running: str = "running"
    successful: str = "successful"
    failed: str = "failed"
