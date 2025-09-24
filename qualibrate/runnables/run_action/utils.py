import inspect
import sys
from types import FrameType

from qualibrate.utils.logger_m import logger


def is_interactive() -> bool:
    return bool(getattr(sys, "ps1", sys.flags.interactive))


def get_frame_to_update_from_action(
    stack: list[inspect.FrameInfo],
) -> FrameType | None:
    without_args = _registered_without_args(stack)
    if without_args is None:
        return None
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


def get_frame_for_keeping_names_from_manager(
    stack: list[inspect.FrameInfo],
) -> FrameType:
    return stack[2].frame


def get_defined_in_frame_names(frame: FrameType) -> set[str]:
    return {
        *frame.f_locals.keys(),
        *frame.f_globals.keys(),
        *frame.f_builtins.keys(),
    }


def _registered_without_args(stack: list[inspect.FrameInfo]) -> bool | None:
    wrapper_frame = stack[1].frame
    wrapper_code = wrapper_frame.f_code
    if (
        wrapper_code.co_name != "wrapper"
        or not wrapper_code.co_filename.endswith("action_manager.py")
    ):
        logger.warning("Can't correctly parse stack trace")
        return None
    action_call_frame = stack[3].frame
    action_call_code = action_call_frame.f_code
    return (
        action_call_code.co_filename.endswith("action_manager.py")
        and action_call_code.co_name == "register_action"
    )
