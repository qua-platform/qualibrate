from enum import Enum

__all__ = ["ElementRunStatus"]


class ElementRunStatus(Enum):
    skipped = "skipped"
    pending = "pending"
    running = "running"
    finished = "finished"
    error = "error"
