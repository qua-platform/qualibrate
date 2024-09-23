from enum import Enum

__all__ = ["Outcome"]


class Outcome(Enum):
    SUCCESSFUL = "successful"
    FAILED = "failed"
