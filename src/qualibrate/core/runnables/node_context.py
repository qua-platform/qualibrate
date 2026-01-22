from typing import Any

from pydantic import BaseModel, ConfigDict


class FractionComplete:
    def __init__(self, fraction: float = 0) -> None:
        self._fraction = fraction


class NodeContext(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    name: str
    parameters: Any
    fraction_compete: FractionComplete
