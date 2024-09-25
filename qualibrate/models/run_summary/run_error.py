from pydantic import BaseModel

__all__ = ["RunError"]


class RunError(BaseModel):
    error_class: str
    message: str
    traceback: list[str]
