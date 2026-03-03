from collections.abc import Callable
from functools import wraps
from typing import Any, ParamSpec, TypeVar

from qualibrate.core.utils.logger_m import logger

# Generic type variables for proper decorator typing:
# P captures the parameter specification (args and kwargs) of the decorated function.
# This ensures the wrapper has the same signature as the original function.
P = ParamSpec("P")

# R captures the return type of the decorated function.
# This allows mypy to know what type the function returns on success.
R = TypeVar("R")


def handle_missing_project(default: Any = None) -> Callable[[Callable[P, R]], Callable[P, R | Any]]:
    """
    Decorator for repository methods to catch RuntimeError
    from missing project keys in PostgresManagement sessions.

    Using generics ensures type safety:
    - The decorated function preserves its original signature (via ParamSpec P)
    - Return type is correctly inferred as either R (success) or the default value (on error)
    - Mypy can verify that callers use the correct arguments and handle the return type properly
    """

    def decorator(func: Callable[P, R]) -> Callable[P, R | Any]:
        @wraps(func)
        def wrapper(*args: P.args, **kwargs: P.kwargs) -> R | Any:
            try:
                return func(*args, **kwargs)
            except RuntimeError as e:
                logger.warning(f"{func.__name__} failed: {e}")
                return default

        return wrapper

    return decorator
