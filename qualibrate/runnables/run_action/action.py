import inspect
from collections.abc import Mapping
from types import FrameType
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
ActionReturnType: TypeAlias = Mapping[str, Any]
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

    def execute_run_action(
        self,
        node: "QualibrationNode[ParametersType, MachineType]",
        *args: Any,
        **kwargs: Any,
    ) -> Optional[ActionReturnType]:
        """
        Executes the stored function with the given node.
        """
        result = self.func(node, *args, **kwargs)
        if not isinstance(result, Mapping):
            return result
        node.namespace.update(result)
        stack = inspect.stack()
        frame_to_update = _get_frame_to_update(stack)
        if frame_to_update is None:
            return result

        frame_to_update.f_locals.update(result)
        return result


def _get_frame_to_update(stack: list[inspect.FrameInfo]) -> Optional[FrameType]:
    without_args = _registered_without_args(stack)
    if not without_args:
        return stack[3].frame

    for i, frame_info in enumerate(stack):
        frame = frame_info.frame
        f_code = frame.f_code
        if (
            f_code.co_filename.endswith("qualibrate/qualibration_node.py")
            and f_code.co_name == "run_action"
            and len(stack) >= i + 1
        ):
            return stack[i + 1].frame
    return None


def _registered_without_args(stack: list[inspect.FrameInfo]) -> bool:
    wrapper_frame = stack[1].frame
    wrapper_code = wrapper_frame.f_code
    if (
        wrapper_code.co_name != "wrapper"
        or not wrapper_code.co_filename.endswith("actions_manager.py")
    ):
        raise RuntimeError("Can't correctly parse stack trace")
    action_call_frame = stack[3].frame
    action_call_code = action_call_frame.f_code
    return (
        action_call_code.co_filename.endswith("actions_manager.py")
        and action_call_code.co_name == "register_action"
    )
