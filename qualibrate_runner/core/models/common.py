"""
Common models for execution tracking.

This module defines shared models used across the qualibrate runner:
- RunError: Captures exception information when executions fail
- StateUpdate: Records changes to quantum machine state (QuAM)

These models are designed to be serializable for API responses and storage.
"""

from typing import Any

from pydantic import BaseModel, Field

__all__ = ["RunError", "StateUpdate"]


class RunError(BaseModel):
    """
    Error information for failed executions.

    When a node or workflow execution fails, this model captures
    error information for debugging and display purposes.

    The information is captured from Python exceptions in run_job.py and
    stored in LastRun.error.

    Attributes:
        error_class: The exception class name (e.g., "ValueError", "KeyError")
        message: The exception's string representation (str(exception))
        traceback: Full Python traceback as a list of formatted strings,
            allowing reconstruction of the error context
    """

    error_class: str = Field(..., description="The class of the error.")
    message: str = Field(..., description="The error message.")

    # details_headline: str = Field(..., description="The headline of the details.")
    # details: str = Field(..., description="The details of the error.")

    traceback: list[str] = Field(..., description="The traceback of the error.")


class StateUpdate(BaseModel):
    """
    Record of a single change to quantum machine state (QuAM).

    During calibration execution, nodes may update the quantum machine state with:
    - Audit trails (what changed and when)
    - Rollback capability (knowing old values)
    - Display in UI (showing calibration effects)

    Each StateUpdate represents one attribute change on one quantum element.

    Attributes:
        key: The QuAM path to the element being updated (e.g., "qubit_0")
        attr: The specific attribute being changed (e.g., "resonance_frequency")
        old: The value before the update
        new: The value after the update
        updated: Whether the update was successfully applied (typically True)
    """

    key: str
    attr: str | int
    old: Any
    new: Any
    updated: bool = False
