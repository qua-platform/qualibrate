from collections.abc import Callable, Mapping
from functools import wraps
from typing import Any, TypeVar, cast

from qualibrate.app.api.exceptions.classes.types import QInvalidIdTypeException

Function = TypeVar("Function", bound=Callable[..., Any])


def extract_tags_from_metadata(metadata: Mapping[str, Any] | None) -> list[str] | None:
    """Extract and validate tags from a metadata dict.

    This utility extracts tags from metadata, ensuring they are valid strings.
    It's used across the codebase wherever tags need to be extracted from
    snapshot metadata.

    Args:
        metadata: A metadata dictionary that may contain a "tags" key,
            or None.

    Returns:
        A list of valid string tags, or None if no valid tags are present.
    """
    if not metadata:
        return None
    raw_tags = metadata.get("tags")
    if isinstance(raw_tags, list):
        tags = [t for t in raw_tags if isinstance(t, str)]
        return tags if tags else None
    return None


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
