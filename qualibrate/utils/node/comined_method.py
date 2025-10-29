from collections.abc import Callable
from typing import Any, TypeVar

T = TypeVar("T")


class InstanceOrClassMethod:
    """
    A descriptor to create a method that can be called as either
    an instance method or a class method.

    The first argument passed to the function will be either the instance
    (if called on an instance) or the class (if called on the class).
    """

    def __init__(self, func: Callable[..., T]) -> None:
        self.func = func

    def __get__(
        self, obj: T, objtype: type[T] | None = None
    ) -> Callable[..., Any]:
        """
        Returns a callable that binds the method to either the instance
        or the class, depending on how it is accessed.
        """
        if obj is not None:  # Instance-level call
            return lambda *args, **kwargs: self.func(obj, *args, **kwargs)
        elif objtype is not None:  # Class-level call
            return lambda *args, **kwargs: self.func(objtype, *args, **kwargs)
        else:
            raise AttributeError("Neither instance nor class was provided.")
