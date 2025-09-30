import inspect
from collections.abc import Callable, Sequence
from functools import wraps
from typing import TYPE_CHECKING, Any, TypeAlias

from qualibrate.runnables.run_action.action import (
    Action,
    ActionCallableType,
    ActionReturnType,
)
from qualibrate.runnables.run_action.utils import (
    get_defined_in_frame_names,
    get_frame_for_keeping_names_from_manager,
)
from qualibrate.utils.logger_m import logger

if TYPE_CHECKING:
    from qualibrate.qualibration_node import QualibrationNode

ActionDecoratorType: TypeAlias = (
    ActionCallableType | Callable[..., ActionCallableType]
)


class ActionManager:
    """
    Manages run actions for a QualibrationNode. It holds an exit flag
    which, once set, prevents further actions from running.
    """

    def __init__(self) -> None:
        self.actions: dict[str, Action] = {}
        self.current_action: Action | None = None
        self._skip_actions: bool = False
        self._skip_actions_names: set[str] = set()
        stack = inspect.stack()
        frame_for_names = get_frame_for_keeping_names_from_manager(stack)
        self.predefined_names = get_defined_in_frame_names(frame_for_names)

    @property
    def skip_actions(self) -> bool | Sequence[str]:
        return self._skip_actions

    @skip_actions.setter
    def skip_actions(self, to_skip: bool | Sequence[str]) -> None:
        if isinstance(to_skip, bool):
            self._skip_actions = to_skip
            self._skip_actions_names = set()
            return
        if isinstance(to_skip, Sequence) and (
            len(to_skip) == 0 or all(map(lambda x: isinstance(x, str), to_skip))
        ):
            self._skip_actions = True
            self._skip_actions_names = set(to_skip)
            return
        raise TypeError(
            f"Invalid value {to_skip} for skip_actions. "
            "Possible types: bool, Sequence[str]"
        )

    def run_action(
        self,
        action_name: str,
        node: "QualibrationNode[Any, Any]",
        *args: Any,
        **kwargs: Any,
    ) -> ActionReturnType | None:
        action = self.actions.get(action_name)
        if action is None:
            logger.warning(f"Can't run action {action_name} of node {node}")
            return None
        if self._skip_actions and (
            len(self._skip_actions_names) == 0
            or action_name in self._skip_actions_names
        ):
            logger.info(f"Skipping action {action_name} of node {node}")
            return None
        return action.execute_run_action(node, *args, **kwargs)

    def register_action(
        self,
        node: "QualibrationNode[Any, Any]",
        func: ActionCallableType | None = None,
        *,
        skip_if: bool = False,
    ) -> ActionDecoratorType:
        """
        Returns a decorator that creates an Action instance and executes
        it immediately.

        Supports usage both without parentheses:

            @node.run_action
            def action(node):
                ...

        and with parentheses:

            @node.run_action(skip_if=True)
            def action(node):
                ...

        Behavior:
          - If skip_if is True, the function is not run.
        """

        def decorator(
            f: ActionCallableType,
        ) -> ActionCallableType:
            nonlocal node
            action = Action(f, self)
            action_name = f.__name__
            node._action_manager.actions[action_name] = action

            @wraps(f)
            def wrapper(*args: Any, **kwargs: Any) -> ActionReturnType | None:
                return self.run_action(action_name, node, *args, **kwargs)

            if skip_if:
                # Skip this action; do not set exit even if exit=True.
                return wrapper
            wrapper()
            return wrapper

        return decorator if func is None else decorator(func)
