from functools import wraps
from typing import Any, Callable, TypeVar, cast

from qualibrate.api.exceptions.classes.types import QInvalidIdTypeException

Function = TypeVar("Function", bound=Callable[..., Any])


def id_type_str(func: Function) -> Function:
    @wraps(func)
    def wrapper(*args, **kwargs):  # type: ignore
        err = QInvalidIdTypeException("id should be str")
        if "id" in kwargs:
            if not isinstance(kwargs["id"], str):
                raise err
        elif len(args) > 0:
            # temporary only for methods
            if len(args) > 1 and not isinstance(args[1], str):
                raise err
        return func(*args, **kwargs)

    return cast(Function, wrapper)
