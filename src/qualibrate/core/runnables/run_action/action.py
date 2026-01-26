"""
Action execution and namespace management for QualibrationNodes.

This module defines the Action class, which wraps functions that are executed
as part of a QualibrationNode's run lifecycle. Actions have special behavior:

1. **Namespace Updates**: If an action returns a dict, it's added to
   node.namespace, making values available to subsequent actions.

2. **Interactive Variable Injection**: In interactive mode
   (running single nodes, not workflows), returned dict items are
   injected into the caller's local scope, allowing users to access
   variables without explicit assignment.

Example:
    @node.run_action
    def prepare_data(node):
        x_data = np.linspace(0, 10, 100)
        y_data = np.sin(x_data)
        return {"x_data": x_data, "y_data": y_data}

    # In interactive mode, x_data and y_data are now available as local vars
    # They're also in node.namespace for use by other actions
"""

import inspect
import weakref
from collections.abc import Callable, Mapping
from typing import (
    TYPE_CHECKING,
    Any,
    TypeAlias,
)

from qualibrate.core.runnables.run_action.utils import (
    get_frame_to_update_from_action,
    is_interactive,
)
from qualibrate.core.utils.logger_m import logger

if TYPE_CHECKING:
    from qualibrate.core.qualibration_node import QualibrationNode
    from qualibrate.core.runnables.run_action.action_manager import ActionManager

ActionReturnType: TypeAlias = Mapping[str, Any]
ActionCallableType: TypeAlias = Callable[..., ActionReturnType | None]


class Action:
    """
    Wraps a function for execution within a QualibrationNode's run cycle.

    An Action represents a single step in a node's execution. It provides:
    - Automatic namespace management (returned dicts update node.namespace)
    - Interactive variable injection (when running single nodes, not workflows)
    - Integration with ActionManager for execution control
    - Tracking of the currently executing action

    The function is stored along with a weak reference to the ActionManager
    to avoid circular references (ActionManager stores Actions, Actions
    reference ActionManager).

    Attributes:
        func: The wrapped function that performs the action's work
        manager: Weak reference to the ActionManager that owns this action
    """

    def __init__(
        self,
        func: ActionCallableType,
        manager: "ActionManager",
    ) -> None:
        """
        Initialize an Action with a function and its manager.

        Args:
            func: The function to wrap. Should accept (node, *args, **kwargs)
                and optionally return a dict to update the namespace
            manager: The ActionManager that will control this action's
                execution. Stored as a weakref to prevent circular references
        """
        self.func = func
        self.manager = weakref.proxy(manager)

    @property
    def name(self) -> str:
        """Get the action's name (the wrapped function's name)."""
        return self.func.__name__

    def _run_and_update_namespace(
        self,
        node: "QualibrationNode[Any, Any]",
        *args: Any,
        **kwargs: Any,
    ) -> ActionReturnType | None:
        """
        Execute the action and update the node's namespace with results.

        This is the core execution method that:
        1. Calls the wrapped function with the node and any arguments
        2. If the result is a dict, updates node.namespace with its contents

        The namespace update allows data to flow between actions - subsequent
        actions can access values stored in the namespace by previous actions.

        Args:
            node: The QualibrationNode instance executing this action
            *args: Positional arguments to pass to the action function
            **kwargs: Keyword arguments to pass to the action function

        Returns:
            The result from the action function (typically a dict or None)
        """
        # Execute the wrapped function
        print(f"Running action {self.name}")
        result = self.func(node, *args, **kwargs)
        print(f"Action {self.name} finished")

        # If the function returned a dict, add it to the node's namespace
        # This makes the values available to subsequent actions
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
        Execute the action with full lifecycle management and variable
        injection.

        This is the main entry point for action execution. It handles:
        1. Tracking the current action in the manager
        2. Clearing the action label on the node (used for UI updates)
        3. Running the action and updating the namespace
        4. In interactive mode: injecting returned variables into caller's scope
        5. Protection against overwriting pre-defined variables

        The interactive variable injection is the "magic" that makes returned
        dict items appear as local variables.

        Args:
            node: The QualibrationNode instance executing this action
            *args: Positional arguments to pass to the action function
            **kwargs: Keyword arguments to pass to the action function

        Returns:
            The result from the action function (typically a dict or None)

        Side Effects:
            - Sets manager.current_action to track execution
            - Updates node.namespace if action returns a dict
            - In interactive mode: injects variables into the caller's frame
        """
        # Track that this action is currently executing
        self.manager.current_action = self

        # Clear action label (used for UI status display)
        node.action_label = None

        try:
            # Execute the action and update the node's namespace
            result = self._run_and_update_namespace(node, *args, **kwargs)

            # If not in interactive mode or no dict returned, we're done
            if not is_interactive() or not isinstance(result, Mapping):
                return result

            # === Interactive Mode: Variable Injection ===
            # This is where the "magic" happens - we inject the returned
            # variables into the caller's local scope
            # (when running single nodes, not workflows)

            # Get the call stack to find the correct frame to update
            stack = inspect.stack()
            frame_to_update = get_frame_to_update_from_action(stack)

            if frame_to_update is None:
                # Couldn't determine the correct frame, skip injection
                return result

            # Check which variables would overwrite pre-existing names
            # predefined_names captured when ActionManager was created
            already_defined = set(result.keys()).intersection(self.manager.predefined_names)

            # Warn about variables that won't be injected (already exist)
            if already_defined:
                logger.warning(
                    f"Variables {tuple(already_defined)} after run action "
                    f"{self.func.__name__} won't be set (already defined)."
                )

            # Inject only new variables (not already defined) into the
            # caller's scope. This makes them available as local variables
            # in the interactive session
            frame_to_update.f_locals.update({k: v for k, v in result.items() if k not in already_defined})

            self.manager.current_action = None
            return result
        except Exception as e:
            self.manager.failed_action = self.name  # Track which action failed
            raise e
