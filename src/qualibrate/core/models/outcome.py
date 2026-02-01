from enum import Enum

__all__ = ["Outcome"]


class Outcome(str, Enum):
    """Outcome status for individual calibration targets/qubits.

    Used when storing raw outcomes in snapshot data (SnapshotData.outcomes):
        {"q1": "successful", "q2": "failed"}

    Note: This differs from the QubitOutcome model used in workflow aggregates
    (SnapshotHistoryItem.outcomes) which has a structured format:
        {"q1": {"status": "success", "failed_on": None}}

    The status values also differ slightly:
        - Outcome: "successful" / "failed"
        - QubitOutcome: "success" / "failure"
    """

    SUCCESSFUL = "successful"
    FAILED = "failed"
