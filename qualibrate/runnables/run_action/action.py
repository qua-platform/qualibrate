from collections.abc import Hashable, Mapping
from typing import (
    TYPE_CHECKING,
    Any,
    Callable,
    Generic,
    Optional,
    TypeVar,
)

from typing_extensions import TypeAlias

from qualibrate.parameters import NodeParameters

if TYPE_CHECKING:
    from qualibrate.qualibration_node import QualibrationNode
    from qualibrate.runnables.run_action.actions_manager import ActionsManager


ParametersType = TypeVar("ParametersType", bound=NodeParameters)
MachineType = TypeVar("MachineType")
ActionReturnType: TypeAlias = Mapping[Hashable, Any]
ActionCallableType: TypeAlias = Callable[..., Optional[ActionReturnType]]


class Action(Generic[ParametersType, MachineType]):
    """
    Represents a single action to be run by a
    QualibrationNode. It stores the decorated function.
    """

    def __init__(
        self,
        func: ActionCallableType,
        manager: "ActionsManager[ParametersType, MachineType]",
    ) -> None:
        self.func = func
        self.manager = manager

    def run(
        self,
        node: "QualibrationNode[ParametersType, MachineType]",
        *args: Any,
        **kwargs: Any,
    ) -> Optional[ActionReturnType]:
        """
        Executes the stored function with the given node.
        """
        result = self.func(node, *args, **kwargs)
        if isinstance(result, Mapping):
            self.manager.namespace.update(result)
        return result
