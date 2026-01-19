"""
Frame manipulation utilities for interactive variable injection.

This module contains low-level utilities that enable the "magic" of injecting
variables from action return values into the caller's local scope in interactive
environments (running single nodes, not workflows, or in Jypiter notebooks).

The core challenge: When an action returns {"x": 1}, how do we make `x` appear
as a local variable in the Jupyter cell that called the action?

Solution: Use Python's inspect.stack() to walk the call stack, identify the
correct frame (the caller's frame), and directly modify frame.f_locals.

This is advanced Python introspection and is inherently fragile
- it depends on:
- Specific function names ("wrapper", "run_action", "register_action")
- Specific file names ("action_manager.py", "qualibration_node.py")
- Stack depth remaining consistent

These functions are ONLY used in interactive mode.
"""

import inspect
import sys
from types import FrameType

from qualibrate.core.utils.logger_m import logger


def is_interactive() -> bool:
    """
    Detect if Python is running in interactive mode.

    Interactive mode could include:
    - Running single nodes, not workflows
    - Jupyter notebooks
    - IPython shells
    - Python REPL (when ps1 is set)

    This detection is used to determine whether to inject variables into the
    caller's local scope. In non-interactive (script) mode, variable injection
    is skipped for performance and safety.

    Returns:
        True if running in interactive mode, False otherwise

    Implementation:
        Checks for sys.ps1 (primary prompt string, set in REPL) or
        sys.flags.interactive (set when Python started with -i flag or in
        interactive shells like IPython/Jupyter)
    """
    return bool(getattr(sys, "ps1", sys.flags.interactive))


def get_frame_to_update_from_action(
    stack: list[inspect.FrameInfo],
) -> FrameType | None:
    """
    Find the correct stack frame to inject variables into.

    This function navigates the call stack to find the frame where the action
    was invoked (typically a Jupyter cell or script). The correct frame depends
    on HOW the decorator was used:

    1. Without parentheses: @node.run_action
       - Stack is shallower, frame is at position 3
    2. With parentheses: @node.run_action(skip_if=True)
       - Stack is deeper, need to search for qualibration_node.py::run_action

    Call stack example (without parentheses):
        [0] get_frame_to_update_from_action  <- we are here
        [1] execute_run_action (action.py)
        [2] wrapper (action_manager.py)
        [3] <user's Jupyter cell>            <- TARGET

    Call stack example (with parentheses):
        [0] get_frame_to_update_from_action  <- we are here
        [1] execute_run_action (action.py)
        [2] wrapper (action_manager.py)
        [3] run_action (action_manager.py)
        [4] run_action (qualibration_node.py)
        [5] <user's Jupyter cell>            <- TARGET (found by search)

    Args:
        stack: The call stack from inspect.stack()

    Returns:
        The FrameType to inject variables into, or None if unable to determine
        the correct frame

    Note:
        This function is FRAGILE - it relies on specific filenames and function
        names remaining consistent. Changes to the decorator implementation or
        QualibrationNode.run_action() may break variable injection.
    """
    # Determine which decorator usage pattern was used
    without_args = _registered_without_args(stack)

    if without_args is None:
        # Could not determine usage pattern, fail safely
        return None

    if not without_args:
        # Decorator WITH parentheses: @node.run_action(...)
        # Stack is shallower, target frame is at fixed position 3
        return stack[3].frame

    # Decorator WITHOUT parentheses: @node.run_action
    # Need to search for the run_action method in qualibration_node.py
    for i, frame_info in enumerate(stack):
        frame = frame_info.frame
        f_code = frame.f_code

        # Look for the run_action method in QualibrationNode
        if (
            f_code.co_filename.endswith("qualibrate/qualibration_node.py")
            and f_code.co_name == "run_action"
            and len(stack) >= i + 1
        ):
            # The frame AFTER this one is the user's calling frame
            return stack[i + 1].frame

    # Could not find the expected frame in the stack
    return None


def get_frame_for_keeping_names_from_manager(
    stack: list[inspect.FrameInfo],
) -> FrameType:
    """
    Get the frame to capture pre-defined variable names from.

    When ActionManager is initialized, it captures all variable names that
    exist at that point (locals, globals, builtins). This prevents actions
    from overwriting these pre-existing variables during interactive injection.

    The correct frame is at position 2 in the stack when __init__ is called:
        [0] get_frame_for_keeping_names_from_manager  <- we are here
        [1] ActionManager.__init__
        [2] QualibrationNode.__init__                <- TARGET
        [3] <user code creating the node>

    Args:
        stack: The call stack from inspect.stack()

    Returns:
        The FrameType to capture variable names from (typically the node's
        __init__ frame)
    """
    return stack[2].frame


def get_defined_in_frame_names(frame: FrameType) -> set[str]:
    """
    Extract all variable names defined in a frame.

    This captures the complete namespace visible from a frame, including:
    - Local variables (frame.f_locals)
    - Global variables (frame.f_globals)
    - Built-in functions/variables (frame.f_builtins)

    These names are used to prevent variable injection from overwriting
    existing variables in interactive mode. For example, if 'x' already
    exists, an action returning {"x": 1} won't overwrite it.

    Args:
        frame: The FrameType to extract names from

    Returns:
        Set of all variable names defined in or accessible from the frame

    Example:
        If a frame has:
        - Local: x, y
        - Global: np, pd
        - Builtin: print, len
        Returns: {"x", "y", "np", "pd", "print", "len", ...}
    """
    return {
        *frame.f_locals.keys(),
        *frame.f_globals.keys(),
        *frame.f_builtins.keys(),
    }


def _registered_without_args(stack: list[inspect.FrameInfo]) -> bool | None:
    """
    Determine if the decorator was used with or without parentheses.

    This function analyzes the call stack to distinguish between:
    - @node.run_action           (without args - returns True)
    - @node.run_action(...)      (with args - returns False)

    The distinction is important because the stack depth differs between the
    two cases, affecting which frame we need to inject variables into.

    Detection logic:
    - Check stack[1] is the "wrapper" function in action_manager.py
    - Check stack[3] (the action call frame):
      - If it's "register_action" in action_manager.py: without args (True)
      - Otherwise: with args (False)

    Call stack for WITHOUT args (@node.run_action):
        [0] _registered_without_args
        [1] wrapper (action_manager.py)
        [2] execute_run_action
        [3] register_action (action_manager.py)
            <- KEY: still in register_action
        ...

    Call stack for WITH args (@node.run_action(...)):
        [0] _registered_without_args
        [1] wrapper (action_manager.py)
        [2] execute_run_action
        [3] run_action (NOT register_action)     <- KEY: left register_action
        ...

    Args:
        stack: The call stack from inspect.stack()

    Returns:
        - True: Decorator used without parentheses
        - False: Decorator used with parentheses
        - None: Could not parse stack (unexpected structure)

    Note:
        This is VERY fragile and depends on exact function names and file
        structure remaining consistent.
    """
    # Verify stack[1] is the wrapper function from action_manager.py
    wrapper_frame = stack[1].frame
    wrapper_code = wrapper_frame.f_code

    if (
        wrapper_code.co_name != "wrapper"
        or not wrapper_code.co_filename.endswith("action_manager.py")
    ):
        # Unexpected stack structure - fail safely
        logger.warning("Can't correctly parse stack trace")
        return None

    # Check stack[3] to see if we're still inside register_action
    action_call_frame = stack[3].frame
    action_call_code = action_call_frame.f_code

    # If stack[3] is register_action in action_manager.py, decorator was used
    # WITHOUT parentheses (immediate execution path is longer/deeper)
    return (
        action_call_code.co_filename.endswith("action_manager.py")
        and action_call_code.co_name == "register_action"
    )
