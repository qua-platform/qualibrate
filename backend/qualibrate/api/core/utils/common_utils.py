from functools import wraps
from inspect import ismethod
from typing import Any, Callable, TypeVar, cast, Optional

Function = TypeVar("Function", bound=Callable[..., Any])


def id_type_str(func: Function) -> Function:
    @wraps(func)
    def wrapper(*args, **kwargs):  # type: ignore
        err = TypeError("id should be str")
        if "id" in kwargs:
            if not isinstance(kwargs["id"], str):
                raise err
        elif len(args) > 0:
            if ismethod(func) and len(args) > 1 and not isinstance(args[1], str):
                raise err
            elif len(args) > 0 and not isinstance(args[0], str):
                raise err
        return func(*args, **kwargs)

    return cast(Function, wrapper)
