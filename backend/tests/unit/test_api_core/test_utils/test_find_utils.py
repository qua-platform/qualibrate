from datetime import datetime, timezone
from types import GeneratorType

import pytest

from qualibrate_app.api.core.domain.local_storage.snapshot import (
    SnapshotLocalStorage,
)
from qualibrate_app.api.core.models.snapshot import (
    MachineSearchResults,
    SimplifiedSnapshot,
    SnapshotSearchResult,
)
from qualibrate_app.api.core.utils import find_utils
from qualibrate_app.api.core.utils.find_utils import get_subpath_value


@pytest.mark.parametrize(
    ("obj", "expected_result"),
    [
        (
            {"a": 1, "b": 2},
            [
                MachineSearchResults(key=["x", "y", "a"], value=1),
                MachineSearchResults(key=["x", "y", "b"], value=2),
            ],
        ),
        (
            [1, 2],
            [
                MachineSearchResults(key=["x", "y", 0], value=1),
                MachineSearchResults(key=["x", "y", 1], value=2),
            ],
        ),
        (
            "st",
            [
                MachineSearchResults(key=["x", "y", 0], value="s"),
                MachineSearchResults(key=["x", "y", 1], value="t"),
            ],
        ),
        (1, []),
    ],
)
def test__get_subpath_value_wildcard_final(mocker, obj, expected_result):
    mocked_base = mocker.patch(
        "qualibrate_app.api.core.utils.find_utils.get_subpath_value",
    )
    assert (
        find_utils._get_subpath_value_wildcard(obj, ["*"], ["x", "y"])
        == expected_result
    )
    mocked_base.assert_not_called()


def test__get_subpath_value_wildcard_non_final_unexpected_type(mocker):
    mocked_base = mocker.patch(
        "qualibrate_app.api.core.utils.find_utils.get_subpath_value",
    )
    assert find_utils._get_subpath_value_wildcard(1, ["*"], ["x", "y"]) == []
    mocked_base.assert_not_called()


@pytest.mark.parametrize(
    ("obj", "expected_current_path"),
    [
        (
            {"a": {"v": 1}, "b": {"v": 2}},
            [["x", "y", "a"], ["x", "y", "b"]],
        ),
        (
            [{"v": 1}, {"v": 2}],
            [["x", "y", 0], ["x", "y", 1]],
        ),
    ],
)
def test__get_subpath_value_wildcard_non_final_deeper(
    mocker, obj, expected_current_path
):
    i = 0

    def _get_subpath_value(*args, **kwargs):
        nonlocal i
        i += 1
        return [i]

    mocked_base = mocker.patch(
        "qualibrate_app.api.core.utils.find_utils.get_subpath_value",
        side_effect=_get_subpath_value,
    )
    target_path = ["*", "v"]
    assert find_utils._get_subpath_value_wildcard(
        obj, target_path, ["x", "y"]
    ) == [
        1,
        2,
    ]

    mocked_base.assert_has_calls(
        [
            mocker.call({"v": i + 1}, ["v"], ex_)
            for i, ex_ in enumerate(expected_current_path)
        ]
    )


@pytest.mark.parametrize(
    "obj, key, expected",
    [
        (123, None, False),
        ([1, 2, 3], 4, False),
        ([1, 2, 3], -1, False),
        ([1, 2, 3], "key", False),
        ({"a": 1}, 1, False),
        ({"a": 1}, "key", False),
        ([1, 2, 3], 2, True),
        ({"a": 1}, "a", True),
    ],
)
def test__check_key_valid(obj, key, expected):
    assert find_utils._check_key_valid(obj, key) is expected


def test_get_subpath_value_empty_target_path():
    assert find_utils.get_subpath_value({"x": "v"}, [], None) == []


def test_get_subpath_value_key_is_wildcard(mocker):
    mocked_wildcard = mocker.patch(
        "qualibrate_app.api.core.utils.find_utils._get_subpath_value_wildcard",
        return_value=[{"k": "v"}],
    )
    assert get_subpath_value({"x": "v"}, ["*", 1], None) == [{"k": "v"}]
    mocked_wildcard.assert_called_once_with({"x": "v"}, ["*", 1], [])


def test_get_subpath_value_invalid_key_or_index(mocker):
    mocked_wildcard = mocker.patch(
        "qualibrate_app.api.core.utils.find_utils._get_subpath_value_wildcard",
    )
    mocked_check = mocker.patch(
        "qualibrate_app.api.core.utils.find_utils._check_key_valid",
        return_value=False,
    )
    assert get_subpath_value({}, ["path"], None) == []
    mocked_wildcard.assert_not_called()
    mocked_check.assert_called_once_with({}, "path")


@pytest.mark.parametrize("obj, key", [({"a": 1}, "a"), ([1], 0)])
def test_get_subpath_value_final_target_key(mocker, obj, key):
    mocked_wildcard = mocker.patch(
        "qualibrate_app.api.core.utils.find_utils._get_subpath_value_wildcard",
    )
    mocked_check = mocker.patch(
        "qualibrate_app.api.core.utils.find_utils._check_key_valid",
        return_value=True,
    )
    assert get_subpath_value(obj, [key], None) == [
        MachineSearchResults(key=[key], value=1)
    ]
    mocked_wildcard.assert_not_called()
    mocked_check.assert_called_once_with(obj, key)


@pytest.mark.parametrize("obj, key", [({"a": {"k": 1}}, "a"), ([{"k": 1}], 0)])
def test_get_subpath_value_list_target_key(mocker, obj, key):
    mocked_wildcard = mocker.patch(
        "qualibrate_app.api.core.utils.find_utils._get_subpath_value_wildcard",
    )
    mocked_check = mocker.patch(
        "qualibrate_app.api.core.utils.find_utils._check_key_valid",
        return_value=True,
    )
    mocked_recursive = mocker.patch(
        "qualibrate_app.api.core.utils.find_utils.get_subpath_value",
        return_value=["a"],
    )
    assert get_subpath_value(obj, [key, "k"], None) == ["a"]
    mocked_wildcard.assert_not_called()
    mocked_check.assert_called_once_with(obj, key)
    mocked_recursive.assert_called_once_with({"k": 1}, ["k"], [key])


@pytest.mark.parametrize("search_result", [None, []])
def test__get_search_result_no_res(mocker, search_result):
    from qualibrate_app.api.core.domain.local_storage.snapshot import (
        SnapshotLocalStorage,
    )

    snapshot = mocker.MagicMock(spec=SnapshotLocalStorage)
    snapshot.search.return_value = search_result
    assert find_utils._get_search_result(snapshot, "path") is None


@pytest.mark.parametrize("search_result", [["a"], ["a", "b"]])
def test__get_search_result_valid(mocker, search_result):
    from qualibrate_app.api.core.domain.local_storage.snapshot import (
        SnapshotLocalStorage,
    )

    snapshot = mocker.MagicMock(spec=SnapshotLocalStorage)
    snapshot.search.return_value = search_result
    assert find_utils._get_search_result(snapshot, "path") == "a"
    snapshot.search.assert_called_once_with("path", load=True)


@pytest.mark.parametrize(
    "machine_res, expected_key, expected_value",
    [
        (
            None,
            None,
            None,
        ),
        (
            MachineSearchResults(key=["k"], value="v"),
            ["k"],
            "v",
        ),
    ],
)
def test__get_snapshot_search_result(
    mocker, machine_res, expected_key, expected_value
):
    snapshot = mocker.MagicMock(spec=SnapshotLocalStorage)
    snapshot_dump = SimplifiedSnapshot(
        id=3,
        created_at=datetime(2025, 7, 4, 0, tzinfo=timezone.utc),
        parents=[2],
    )
    snapshot.dump.return_value = snapshot_dump
    assert find_utils._get_snapshot_search_result(
        snapshot, machine_res
    ) == SnapshotSearchResult(
        key=expected_key,
        value=expected_value,
        snapshot=snapshot_dump,
    )
    snapshot.dump.assert_called_once_with()


def test_search_snapshots_data_with_filter_ascending_empty_iter(mocker):
    patched_get_res = mocker.patch(
        "qualibrate_app.api.core.utils.find_utils._get_search_result",
    )
    assert (
        list(
            find_utils.search_snapshots_data_with_filter_ascending(
                iter([]), "path", False
            )
        )
        == []
    )
    patched_get_res.assert_not_called()


def test_search_snapshots_data_with_filter_ascending_filter_no_change(mocker):
    search_res = ["a", "a", "b", "b", "b", "c"]
    snapshots = [f"s{i}" for i in range(len(search_res))]
    patched_get_res = mocker.patch(
        "qualibrate_app.api.core.utils.find_utils._get_search_result",
        side_effect=search_res,
    )
    patched_get_s_res = mocker.patch(
        "qualibrate_app.api.core.utils.find_utils._get_snapshot_search_result",
        side_effect=lambda *args: args,
    )
    res_gen = find_utils.search_snapshots_data_with_filter_ascending(
        iter(snapshots), "path", True
    )
    assert isinstance(res_gen, GeneratorType)
    res_list = list(res_gen)
    patched_get_res.assert_has_calls(
        [mocker.call(s, "path") for s in snapshots]
    )
    expected_res = [("s0", "a"), ("s2", "b"), ("s5", "c")]
    patched_get_s_res.assert_has_calls([mocker.call(*a) for a in expected_res])
    assert res_list == expected_res


def test_search_snapshots_data_with_filter_ascending_no_filter_no_change(
    mocker,
):
    search_res = ["a", "a", "b", "b", "b", "c"]
    snapshots = [f"s{i}" for i in range(len(search_res))]
    patched_get_res = mocker.patch(
        "qualibrate_app.api.core.utils.find_utils._get_search_result",
        side_effect=search_res,
    )
    patched_get_s_res = mocker.patch(
        "qualibrate_app.api.core.utils.find_utils._get_snapshot_search_result",
        side_effect=lambda *args: args,
    )
    res_gen = find_utils.search_snapshots_data_with_filter_ascending(
        iter(snapshots), "path", False
    )
    assert isinstance(res_gen, GeneratorType)
    res_list = list(res_gen)
    patched_get_res.assert_has_calls(
        [mocker.call(s, "path") for s in snapshots]
    )
    expected_res = list(zip(snapshots, search_res, strict=False))
    patched_get_s_res.assert_has_calls([mocker.call(*a) for a in expected_res])
    assert res_list == expected_res


def test_search_snapshots_data_with_filter_descending_empty_iter(mocker):
    patched_get_res = mocker.patch(
        "qualibrate_app.api.core.utils.find_utils._get_search_result",
    )
    assert (
        list(
            find_utils.search_snapshots_data_with_filter_descending(
                iter([]), "path", False
            )
        )
        == []
    )
    patched_get_res.assert_not_called()


def test_search_snapshots_data_with_filter_descending_filter_no_change(mocker):
    search_res = ["a", "a", "b", "b", "b", "c"]
    snapshots = [f"s{i}" for i in range(len(search_res))]
    patched_get_res = mocker.patch(
        "qualibrate_app.api.core.utils.find_utils._get_search_result",
        side_effect=search_res,
    )
    patched_get_s_res = mocker.patch(
        "qualibrate_app.api.core.utils.find_utils._get_snapshot_search_result",
        side_effect=lambda *args: args,
    )
    res_gen = find_utils.search_snapshots_data_with_filter_descending(
        iter(snapshots), "path", True
    )
    assert isinstance(res_gen, GeneratorType)
    res_list = list(res_gen)
    patched_get_res.assert_has_calls(
        [mocker.call(s, "path") for s in snapshots]
    )
    expected_res = [("s1", "a"), ("s4", "b"), ("s5", "c")]
    patched_get_s_res.assert_has_calls([mocker.call(*a) for a in expected_res])
    assert res_list == expected_res


def test_search_snapshots_data_with_filter_descending_no_filter_no_change(
    mocker,
):
    search_res = ["a", "a", "b", "b", "b", "c"]
    snapshots = [f"s{i}" for i in range(len(search_res))]
    patched_get_res = mocker.patch(
        "qualibrate_app.api.core.utils.find_utils._get_search_result",
        side_effect=search_res,
    )
    patched_get_s_res = mocker.patch(
        "qualibrate_app.api.core.utils.find_utils._get_snapshot_search_result",
        side_effect=lambda *args: args,
    )
    res_gen = find_utils.search_snapshots_data_with_filter_descending(
        iter(snapshots), "path", False
    )
    assert isinstance(res_gen, GeneratorType)
    res_list = list(res_gen)
    patched_get_res.assert_has_calls(
        [mocker.call(s, "path") for s in snapshots]
    )
    expected_res = list(zip(snapshots, search_res, strict=False))
    patched_get_s_res.assert_has_calls([mocker.call(*a) for a in expected_res])
    assert res_list == expected_res
