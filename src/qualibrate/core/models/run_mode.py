from pydantic import BaseModel

__all__ = ["RunModes"]


class RunModes(BaseModel):
    inspection: bool = False
    interactive: bool = False
    external: bool = False
