from collections.abc import Callable, Generator, Iterator, Mapping, Sequence
from itertools import chain
from typing import (
    TYPE_CHECKING,
    Any,
    TypeVar,
    cast,
)

from qualibrate_app.api.core.models.snapshot import (
    MachineSearchResults,
    SnapshotSearchResult,
)

if TYPE_CHECKING:
    from qualibrate_app.api.core.domain.bases.snapshot import SnapshotBase


def _get_subpath_value_wildcard(
    obj: Mapping[str, Any] | Sequence[Any],
    target_path: Sequence[str | int],
    current_path: list[str | int],
) -> Sequence[MachineSearchResults]:
    if len(target_path) == 1:
        if isinstance(obj, Sequence):
            return [
                MachineSearchResults(key=current_path + [i], value=val)
                for i, val in enumerate(obj)
            ]
        elif isinstance(obj, Mapping):
            return [
                MachineSearchResults(key=current_path + [key], value=val)
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
) -> Sequence[MachineSearchResults]:
    if len(target_path) == 1:
        return [MachineSearchResults(key=current_path + [key], value=obj[key])]
    else:
        return get_subpath_value(
            obj[key], target_path[1:], current_path + [key]
        )


def get_subpath_value_sequence(
    obj: Sequence[Any],
    target_path: Sequence[str | int],
    current_path: list[str | int],
    key: int,
) -> Sequence[MachineSearchResults]:
    if len(target_path) == 1:
        return [MachineSearchResults(key=current_path + [key], value=obj[key])]
    else:
        return get_subpath_value(
            obj[key], target_path[1:], current_path + [key]
        )


def get_subpath_value(
    obj: Mapping[str, Any] | Sequence[Any],
    target_path: Sequence[str | int],
    current_path: list[str | int] | None = None,
) -> Sequence[MachineSearchResults]:
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
    paths: list[MachineSearchResults] | None = None,
) -> list[MachineSearchResults]:
    if current_path is None:
        current_path = []
    if paths is None:
        paths = []
    if isinstance(obj, Mapping):
        for k, v in obj.items():
            if k == key:
                paths.append(
                    MachineSearchResults(key=current_path + [k], value=v)
                )
            else:
                get_subpath_value_on_any_depth(
                    v, key, current_path + [k], paths
                )
    elif isinstance(obj, Sequence) and not isinstance(obj, str):
        for i, item in enumerate(obj):
            get_subpath_value_on_any_depth(item, key, current_path + [i], paths)
    return paths


SnapshotType = TypeVar("SnapshotType", bound="SnapshotBase")


def _get_search_result(
    snapshot: SnapshotType, data_path: Sequence[str | int]
) -> MachineSearchResults | None:
    search_results = snapshot.search(data_path, load=True)
    return (
        search_results[0]
        if search_results and len(search_results) > 0
        else None
    )


def _get_snapshot_search_result(
    snapshot: SnapshotType,
    result: MachineSearchResults | None,
) -> SnapshotSearchResult:
    result_dict = {} if result is None else result.model_dump()
    snapshot_dump = snapshot.dump()
    return SnapshotSearchResult(snapshot=snapshot_dump, **result_dict)


def search_snapshots_data_with_filter_ascending(
    snapshots: Iterator[SnapshotType],
    data_path: Sequence[str | int],
    filter_no_change: bool,
) -> Generator[SnapshotSearchResult, None, None]:
    previous_search_result: MachineSearchResults | None = None
    for snapshot in snapshots:
        search_result = _get_search_result(snapshot, data_path)
        if filter_no_change:
            if previous_search_result != search_result:
                previous_search_result = search_result
                yield _get_snapshot_search_result(
                    snapshot, previous_search_result
                )
        else:
            yield _get_snapshot_search_result(snapshot, search_result)


def search_snapshots_data_with_filter_descending(
    snapshots: Iterator[SnapshotType],
    data_path: Sequence[str | int],
    filter_no_change: bool,
) -> Generator[SnapshotSearchResult, None, None]:
    snapshot = next(snapshots, None)
    if snapshot is None:
        return
    search_result = _get_search_result(snapshot, data_path)
    if not filter_no_change:
        yield _get_snapshot_search_result(snapshot, search_result)
        for snapshot in snapshots:
            search_result = _get_search_result(snapshot, data_path)
            yield _get_snapshot_search_result(snapshot, search_result)
        return
    previous: tuple[SnapshotType, Any] = snapshot, search_result
    for snapshot in snapshots:
        search_result = _get_search_result(snapshot, data_path)
        if previous[1] != search_result:
            yield _get_snapshot_search_result(*previous)
        previous = snapshot, search_result
    yield _get_snapshot_search_result(*previous)
