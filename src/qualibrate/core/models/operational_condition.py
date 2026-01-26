from collections.abc import Callable, Generator
from typing import Generic

from pydantic import BaseModel

from qualibrate.core.utils.graph_building import GraphElementTypeVar
from qualibrate.core.utils.type_protocols import TargetType


class OperationalCondition(BaseModel, Generic[GraphElementTypeVar]):
    on_function: Callable[[GraphElementTypeVar, TargetType], bool] | None = None
    on_generator: (
        Callable[
            [],
            Generator[bool, tuple[GraphElementTypeVar, TargetType] | None, None],
        ]
        | None
    ) = None


class LoopCondition(OperationalCondition[GraphElementTypeVar]):
    max_iterations: int | None = None
    on_failure: bool = False
