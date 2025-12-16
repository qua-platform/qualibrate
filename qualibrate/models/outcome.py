from enum import Enum

__all__ = ["Outcome"]


class Outcome(str, Enum):
    SUCCESSFUL = "successful"
    FAILED = "failed"
