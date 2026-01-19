"""
Action management and execution control for QualibrationNodes.

This module provides the ActionManager class, which orchestrates the execution
of actions within a QualibrationNode. Key responsibilities:

1. **Action Registry**: Maintains a dict of all actions for a node
2. **Execution Control**: Can skip all actions or specific named actions
3. **Decorator Pattern**: Provides @node.run_action decorator that both
   registers AND immediately executes actions
4. **Variable Protection**: Captures pre-defined names to prevent overwriting
   them during interactive variable injection

The decorator pattern is unusual: decorating a function with @node.run_action
causes it to execute immediately (unless skip_if=True), rather than just
defining it for later use.

Example:
    node = QualibrationNode(...)

    # This runs immediately when defined (unless skip_actions is set)
    @node.run_action
    def prepare_data(node):
        return {"data": [1, 2, 3]}

    # This is registered but NOT run
    @node.run_action(skip_if=True)
    def optional_step(node):
        return {"optional": "value"}
"""

import inspect
from collections.abc import Callable, Sequence
from functools import wraps
from typing import TYPE_CHECKING, Any, TypeAlias

from qualibrate.core.runnables.run_action.action import (
    Action,
    ActionCallableType,
    ActionReturnType,
)
from qualibrate.core.runnables.run_action.utils import (
    get_defined_in_frame_names,
    get_frame_for_keeping_names_from_manager,
)
from qualibrate.core.utils.logger_m import logger

if TYPE_CHECKING:
    from qualibrate.core.qualibration_node import QualibrationNode

ActionDecoratorType: TypeAlias = (
    ActionCallableType | Callable[..., ActionCallableType]
)


class ActionManager:
    """
    Orchestrates action registration, execution, and control for a node.

    The ActionManager is responsible for:
    - Maintaining a registry of all actions (by name)
    - Tracking which action is currently executing
    - Controlling which actions run via skip_actions mechanism
    - Capturing pre-defined variable names to prevent overwrites during
      interactive variable injection

    Each QualibrationNode has exactly one ActionManager instance created
    during node initialization.

    Attributes:
        actions: Dictionary mapping action names to Action instances
        current_action: The Action currently being executed (None if idle)
        predefined_names: Set of variable names that existed when the manager
            was created, used to prevent overwriting them during variable
            injection in interactive mode
    """

    def __init__(self) -> None:
        """
        Initialize the ActionManager and capture pre-defined variable names.

        The initialization captures all names defined in the calling scope
        (locals, globals, builtins) at the time the manager is created. This
        snapshot is used later to prevent actions from overwriting these
        pre-existing variables during interactive variable injection.
        """
        # Registry of all actions for this node
        self.actions: dict[str, Action] = {}

        # Track the currently executing action (for monitoring/debugging)
        self.current_action: Action | None = None

        # Action skipping control
        self._skip_actions: bool = False  # Skip all actions if True
        self._skip_actions_names: set[str] = set()  # Skip specific actions

        # Capture pre-defined names to protect during variable injection
        # This prevents actions from overwriting existing variables in
        # interactive sessions
        stack = inspect.stack()
        frame_for_names = get_frame_for_keeping_names_from_manager(stack)
        self.predefined_names = get_defined_in_frame_names(frame_for_names)

        # Action execution history (for error reporting)
        # Actions that finished successfully
        self.completed_actions: list[str] = []
        # Actions that were skipped
        self.skipped_actions: list[str] = []
        # Action that raised an error (if any)
        self.failed_action: str | None = None

    @property
    def skip_actions(self) -> bool | Sequence[str]:
        return self._skip_actions

    @skip_actions.setter
    def skip_actions(self, to_skip: bool | Sequence[str]) -> None:
        if isinstance(to_skip, bool):
            # Boolean mode: skip all (True) or none (False)
            self._skip_actions = to_skip
            self._skip_actions_names = set()  # Clear specific names
            return

        if isinstance(to_skip, Sequence) and (
            len(to_skip) == 0 or all(map(lambda x: isinstance(x, str), to_skip))
        ):
            # Sequence mode: skip specific named actions
            self._skip_actions = True  # Enable skipping
            self._skip_actions_names = set(to_skip)  # Store names to skip
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
        """
        Execute a registered action by name, respecting skip settings.

        This method:
        1. Looks up the action in the registry
        2. Checks if it should be skipped
        3. Delegates to action.execute_run_action() if not skipped

        The skip logic:
        - If skip_actions is False: run the action
        - If skip_actions is True and _skip_actions_names is empty: skip all
        - If skip_actions is True and _skip_actions_names has items: skip only
          those named actions

        Args:
            action_name: The name of the action to run (function name)
            node: The QualibrationNode instance executing the action
            *args: Positional arguments to pass to the action
            **kwargs: Keyword arguments to pass to the action

        Returns:
            The result from the action (typically a dict or None), or None
            if the action was skipped or not found
        """
        # Look up the action in the registry
        action = self.actions.get(action_name)

        if action is None:
            # Action not registered - this is unexpected
            logger.warning(f"Can't run action {action_name} of node {node}")
            return None

        # Check if this action should be skipped
        if self._skip_actions and (
            # Skip all actions
            len(self._skip_actions_names) == 0
            # Skip this specific action
            or action_name in self._skip_actions_names
        ):
            logger.info(f"Skipping action {action_name} of node {node}")
            self.skipped_actions.append(action_name)  # Track skipped action
            return None

        # Execute the action
        result = action.execute_run_action(node, *args, **kwargs)

        # Track successful completion
        self.completed_actions.append(action_name)

        return result

    def register_action(
        self,
        node: "QualibrationNode[Any, Any]",
        func: ActionCallableType | None = None,
        *,
        skip_if: bool = False,
    ) -> ActionDecoratorType:
        """
        Decorator factory for registering and executing node actions.

        This method implements an unusual decorator pattern: when you decorate
        a function with @node.run_action, the function is BOTH registered in
        the action registry AND executed immediately (unless skip_if=True).

        This "define-and-execute" pattern is designed for linear notebook-style
        workflows where you want actions to run as they're defined.

        Supports two usage patterns:
        1. Without parentheses: @node.run_action
           - Registers and immediately executes the action
        2. With parentheses: @node.run_action(skip_if=True)
           - Registers but does NOT execute the action

        The decorated function is replaced with a wrapper that calls
        run_action(), in principle allowing it to be called again later
        if needed.

        Args:
            node: The QualibrationNode instance that owns this action
            func: The function to decorate (None when called with parentheses)
            skip_if: If True, register but don't execute

        Returns:
            Either:
            - The decorator function (if func is None, i.e., called with parens)
            - The wrapper function (if func provided, i.e., no parens)

        Examples:
            # Define and execute immediately
            @node.run_action
            def prepare_data(node):
                return {"data": [1, 2, 3]}
            # prepare_data has already run at this point!

            # Define but don't execute (conditional execution)
            @node.run_action(skip_if=some_condition)
            def optional_step(node):
                return {"result": "value"}

            # Call the action again later
            prepare_data()  # Runs the action again
        """

        def decorator(
            f: ActionCallableType,
        ) -> ActionCallableType:
            """Inner decorator that performs registration and execution."""
            nonlocal node

            # Create an Action instance wrapping the function
            action = Action(f, self)
            action_name = f.__name__

            # Register the action in the manager's registry
            node._action_manager.actions[action_name] = action

            # Create a wrapper that calls run_action when invoked
            # This allows the decorated function to be called later
            @wraps(f)
            def wrapper(*args: Any, **kwargs: Any) -> ActionReturnType | None:
                return self.run_action(action_name, node, *args, **kwargs)

            # If skip_if is True, return wrapper WITHOUT executing it
            # This allows conditional registration without execution
            if skip_if:
                node._action_manager.skipped_actions.append(action_name)
                return wrapper

            # Execute the action immediately (the unusual behavior!)
            wrapper()

            # Return the wrapper for potential future calls
            return wrapper

        # Support both @decorator and @decorator() syntax
        # If func is None, we were called with parentheses: @node.run_action()
        # If func is provided, we were called without: @node.run_action
        return decorator if func is None else decorator(func)
