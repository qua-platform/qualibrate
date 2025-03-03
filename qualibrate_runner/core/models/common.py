from typing import Any, Union

from pydantic import BaseModel, Field

__all__ = ["RunError", "StateUpdate"]


class RunError(BaseModel):
    """Model representing an error encountered during execution."""

    error_class: str = Field(..., description="The class of the error.")
    message: str = Field(..., description="The error message.")
    traceback: list[str] = Field(..., description="The traceback of the error.")


class StateUpdate(BaseModel):
    key: str
    attr: Union[str, int]
    old: Any
    new: Any
    updated: bool = False
