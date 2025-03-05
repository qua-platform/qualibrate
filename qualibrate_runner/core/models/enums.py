from enum import Enum


class RunStatusEnum(Enum):
    """Enum representing the status of a run."""

    IDLE = "idle"
    RUNNING = "running"
    FINISHED = "finished"
    ERROR = "error"


class RunnableType(Enum):
    """Enum representing the type of runnable entity."""

    NODE = "node"
    GRAPH = "graph"
