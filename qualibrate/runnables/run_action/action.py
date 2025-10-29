import inspect
import weakref
from collections.abc import Callable, Mapping
from typing import (
    TYPE_CHECKING,
    Any,
    TypeAlias,
)

from qualibrate.runnables.run_action.utils import (
    get_frame_to_update_from_action,
    is_interactive,
)
from qualibrate.utils.logger_m import logger

if TYPE_CHECKING:
    from qualibrate.qualibration_node import QualibrationNode
    from qualibrate.runnables.run_action.action_manager import ActionManager

ActionReturnType: TypeAlias = Mapping[str, Any]
ActionCallableType: TypeAlias = Callable[..., ActionReturnType | None]


class Action:
    """
    Represents a single action to be run by a
    QualibrationNode. It stores the decorated function.
    """

    def __init__(
        self,
        func: ActionCallableType,
        manager: "ActionManager",
    ) -> None:
        self.func = func
        self.manager = weakref.proxy(manager)

    @property
    def name(self) -> str:
        return self.func.__name__

    def _run_and_update_namespace(
        self,
        node: "QualibrationNode[Any, Any]",
        *args: Any,
        **kwargs: Any,
    ) -> ActionReturnType | None:
        result = self.func(node, *args, **kwargs)
        if isinstance(result, Mapping):
            node.namespace.update(result)
        return result

    def execute_run_action(
        self,
        node: "QualibrationNode[Any, Any]",
        *args: Any,
        **kwargs: Any,
    ) -> ActionReturnType | None:
        """
        Executes the stored function with the given node.
        """
        self.manager.current_action = self
        node.action_label = None
        result = self._run_and_update_namespace(node, *args, **kwargs)
        node.action_label = None
        self.manager.current_action = None
        if not is_interactive() or not isinstance(result, Mapping):
            return result
        stack = inspect.stack()
        frame_to_update = get_frame_to_update_from_action(stack)
        if frame_to_update is None:
            return result
        already_defined = set(result.keys()).intersection(
            self.manager.predefined_names
        )
        if already_defined:
            logger.warning(
                f"Variables {tuple(already_defined)} after run action "
                f"{self.func.__name__} won't be set (already defined)."
            )
        frame_to_update.f_locals.update(
            {k: v for k, v in result.items() if k not in already_defined}
        )
        return result
