from itertools import chain
from typing import Mapping, Optional, Any, Sequence, Union, Callable, cast

from qualibrate_api_base.api_bases import DocumentsSequence


def _get_subpath_value_wildcard(
    obj: Union[Mapping[str, Any], Sequence[Any]],
    target_path: list[Union[str, int]],
    current_path: list[Union[str, int]],
) -> DocumentsSequence:
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
        Callable[..., tuple[Union[str, int], Any]],
        enumerate if isinstance(obj, Sequence) else dict.items,
    )
    return list(
        chain.from_iterable(
            get_subpath_value(value, target_path[1:], current_path + [idx])
            for idx, value in iter_function(obj)
        )
    )


def get_subpath_value(
    obj: Union[Mapping[str, Any], Sequence[Any]],
    target_path: list[Union[str, int]],
    current_path: Optional[list[Union[str, int]]] = None,
) -> DocumentsSequence:
    if current_path is None:
        current_path = []
    key = target_path[0]
    if key == "*":
        return _get_subpath_value_wildcard(obj, target_path[1:], current_path)
    if (
        not isinstance(obj, (Sequence, Mapping))
        or (
            isinstance(obj, Sequence)
            and isinstance(key, int)
            and key >= len(obj)
        )
        or (
            isinstance(obj, Mapping) and isinstance(key, str) and key not in obj
        )
    ):
        return []
    cast_f = str if isinstance(obj, Mapping) else int
    if len(target_path) == 1:
        return [{"key": current_path + [key], "value": obj[cast_f(key)]}]
    else:
        return get_subpath_value(
            obj[cast_f(key)], target_path[1:], current_path + [key]
        )


def get_subpath_value_on_any_depth(
    obj: Union[Mapping[str, Any], Sequence[Any]],
    key: str,
    current_path: Optional[list[Union[str, int]]] = None,
    paths: Optional[list[dict[str, Any]]] = None,
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
    elif isinstance(obj, Sequence):
        for i, item in enumerate(obj):
            get_subpath_value_on_any_depth(item, key, current_path + [i], paths)
    return paths
