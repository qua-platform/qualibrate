from collections.abc import Callable
from functools import wraps
from typing import Any, TypeVar, cast

from qualibrate_app.api.exceptions.classes.types import QInvalidIdTypeException

Function = TypeVar("Function", bound=Callable[..., Any])


def id_type_str(func: Function) -> Function:
    @wraps(func)
    def wrapper(*args, **kwargs):  # type: ignore
        err = QInvalidIdTypeException("id should be str")
        if "id" in kwargs and not isinstance(kwargs["id"], str):
            raise err
        elif len(args) > 0 and len(args) > 1 and not isinstance(args[1], str):
            # temporary only for methods
            raise err
        return func(*args, **kwargs)

    return cast(Function, wrapper)
