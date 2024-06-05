from functools import cache

from qualibrate_runner.config import State


@cache
def get_state() -> State:
    return State()
