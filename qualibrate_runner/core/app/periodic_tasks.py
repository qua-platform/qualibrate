import asyncio
from collections.abc import Coroutine
from functools import wraps
from typing import Any, Callable, Optional, Union

from fastapi.concurrency import run_in_threadpool

NoArgsNoReturnFuncT = Callable[[], None]
NoArgsNoReturnAsyncFuncT = Callable[[], Coroutine[Any, Any, None]]
ExcArgNoReturnFuncT = Callable[[Exception], None]
ExcArgNoReturnAsyncFuncT = Callable[[Exception], Coroutine[Any, Any, None]]
NoArgsNoReturnAnyFuncT = Union[NoArgsNoReturnFuncT, NoArgsNoReturnAsyncFuncT]
ExcArgNoReturnAnyFuncT = Union[ExcArgNoReturnFuncT, ExcArgNoReturnAsyncFuncT]

__all__ = ["repeat_every"]


async def _handle_func(func: NoArgsNoReturnAnyFuncT) -> None:
    if asyncio.iscoroutinefunction(func):
        await func()
    else:
        await run_in_threadpool(func)


async def _handle_exc(
    exc: Exception, on_exception: Optional[ExcArgNoReturnAnyFuncT]
) -> None:
    if on_exception is None:
        return
    if asyncio.iscoroutinefunction(on_exception):
        await on_exception(exc)
    else:
        await run_in_threadpool(on_exception, exc)


def repeat_every(
    *,
    seconds: float,
    on_exception: Optional[Callable[[Exception], None]] = None,
) -> Callable[[NoArgsNoReturnAnyFuncT], NoArgsNoReturnAsyncFuncT]:
    """
    This function returns a decorator that modifies a function so it is
    periodically re-executed after its first call.
    The function it decorates should accept no arguments and return nothing.

    Parameters
    ----------
    seconds: float
        The number of seconds to wait between repeated calls
    on_exception: Optional[Callable[[Exception], None]] (default None)
        A function to call when an exception is raised by the decorated
        function.
    """

    def decorator(func: NoArgsNoReturnAnyFuncT) -> NoArgsNoReturnAsyncFuncT:
        """
        Converts the decorated function into a repeated,
        periodically-called version of itself.
        """

        @wraps(func)
        async def wrapped() -> None:
            async def loop() -> None:
                while True:
                    try:
                        await _handle_func(func)
                    except Exception as exc:
                        await _handle_exc(exc, on_exception)
                    await asyncio.sleep(seconds)

            asyncio.ensure_future(loop())

        return wrapped

    return decorator
