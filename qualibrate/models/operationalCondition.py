from qualibrate.models.outcome import Outcome
from qualibrate.utils.graph_building import (
    GraphElementTypeVar)
from pydantic import BaseModel
from typing import Generic
from collections.abc import Generator, Callable
from qualibrate.utils.type_protocols import TargetType


class OperationalCondition(BaseModel, Generic[GraphElementTypeVar]):
    # on_failure: bool = False
    on_scenario : Outcome
    on_function: Callable[[GraphElementTypeVar, TargetType], bool] | None = None
    on_generator: (
        Callable[
            [],
            Generator[
                bool, tuple[GraphElementTypeVar, TargetType] | None, None
            ],
        ]
        | None
    ) = None
