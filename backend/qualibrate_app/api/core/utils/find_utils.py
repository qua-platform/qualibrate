from collections.abc import Callable, Mapping, Sequence
from itertools import chain
from typing import Any, cast

from qualibrate_app.api.core.types import DocumentSequenceType


def _get_subpath_value_wildcard(
    obj: Mapping[str, Any] | Sequence[Any],
    target_path: Sequence[str | int],
    current_path: list[str | int],
) -> DocumentSequenceType:
    if len(target_path) == 1:
        if isinstance(obj, Sequence):
            return [
                {"key": current_path + [i], "value": val}
                for i, val in enumerate(obj)
            ]
        elif isinstance(obj, Mapping):
            return [
                {"key": current_path + [key], "value": val}
                for key, val in obj.items()
            ]
        else:
            return []

    if not isinstance(obj, (Mapping, Sequence)):
        return []
    iter_function = cast(
        Callable[..., Sequence[tuple[str, Any]] | Sequence[tuple[int, Any]]],
        enumerate if isinstance(obj, Sequence) else dict.items,
    )
    return list(
        chain.from_iterable(
            get_subpath_value(value, target_path[1:], current_path + [idx])
            for idx, value in iter_function(obj)
        )
    )


def _check_key_valid(obj: Any, key: str | int) -> bool:
    if isinstance(obj, Sequence):
        return isinstance(key, int) and 0 <= key < len(obj)
    if isinstance(obj, Mapping):
        return isinstance(key, str) and key in obj
    return False


def get_subpath_value_mapping(
    obj: Mapping[str, Any],
    target_path: Sequence[str | int],
    current_path: list[str | int],
    key: str,
) -> DocumentSequenceType:
    if len(target_path) == 1:
        return [{"key": current_path + [key], "value": obj[key]}]
    else:
        return get_subpath_value(
            obj[key], target_path[1:], current_path + [key]
        )


def get_subpath_value_sequence(
    obj: Sequence[Any],
    target_path: Sequence[str | int],
    current_path: list[str | int],
    key: int,
) -> DocumentSequenceType:
    if len(target_path) == 1:
        return [{"key": current_path + [key], "value": obj[key]}]
    else:
        return get_subpath_value(
            obj[key], target_path[1:], current_path + [key]
        )


def get_subpath_value(
    obj: Mapping[str, Any] | Sequence[Any],
    target_path: Sequence[str | int],
    current_path: list[str | int] | None = None,
) -> DocumentSequenceType:
    if current_path is None:
        current_path = []
    if len(target_path) == 0:
        return []
    key = target_path[0]
    if key == "*":
        return _get_subpath_value_wildcard(obj, target_path, current_path)
    key_valid = _check_key_valid(obj, key)
    if not key_valid:
        return []
    if isinstance(obj, Mapping):
        return get_subpath_value_mapping(
            obj, target_path, current_path, cast(str, key)
        )
    return get_subpath_value_sequence(
        obj, target_path, current_path, cast(int, key)
    )


def get_subpath_value_on_any_depth(
    obj: Mapping[str, Any] | Sequence[Any],
    key: str,
    current_path: list[str | int] | None = None,
    paths: list[dict[str, Any]] | None = None,
) -> list[dict[str, Any]]:
    if current_path is None:
        current_path = []
    if paths is None:
        paths = []
    if isinstance(obj, Mapping):
        for k, v in obj.items():
            if k == key:
                paths.append({"path": current_path + [k], "value": v})
            else:
                get_subpath_value_on_any_depth(
                    v, key, current_path + [k], paths
                )
    elif isinstance(obj, Sequence) and not isinstance(obj, str):
        for i, item in enumerate(obj):
            get_subpath_value_on_any_depth(item, key, current_path + [i], paths)
    return paths
