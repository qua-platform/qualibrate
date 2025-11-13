from enum import Enum

__all__ = ["ElementRunStatus"]


class ElementRunStatus(Enum):
    pending = "pending"
    running = "running"
    finished = "finished"
    error = "error"
