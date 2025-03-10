from enum import Enum

__all__ = ["NodeStatus"]


class NodeStatus(Enum):
    pending = "pending"
    running = "running"
    finished = "finished"
    error = "error"
