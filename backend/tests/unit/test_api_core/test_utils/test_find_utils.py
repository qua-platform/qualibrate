import pytest

from qualibrate_app.api.core.utils import find_utils
from qualibrate_app.api.core.utils.find_utils import get_subpath_value


@pytest.mark.parametrize(
    ("obj", "expected_result"),
    [
        (
            {"a": 1, "b": 2},
            [
                {"key": ["x", "y", "a"], "value": 1},
                {"key": ["x", "y", "b"], "value": 2},
            ],
        ),
        (
            [1, 2],
            [
                {"key": ["x", "y", 0], "value": 1},
                {"key": ["x", "y", 1], "value": 2},
            ],
        ),
        (
            "st",
            [
                {"key": ["x", "y", 0], "value": "s"},
                {"key": ["x", "y", 1], "value": "t"},
            ],
        ),
        (1, []),
    ],
)
def test__get_subpath_value_wildcard_final(mocker, obj, expected_result):
    mocked_base = mocker.patch(
        "qualibrate.api.core.utils.find_utils.get_subpath_value",
    )
    assert (
        find_utils._get_subpath_value_wildcard(obj, ["*"], ["x", "y"])
        == expected_result
    )
    mocked_base.assert_not_called()


def test__get_subpath_value_wildcard_non_final_unexpected_type(mocker):
    mocked_base = mocker.patch(
        "qualibrate.api.core.utils.find_utils.get_subpath_value",
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
        "qualibrate.api.core.utils.find_utils.get_subpath_value",
        side_effect=_get_subpath_value,
    )
    target_path = ["*", "v"]
    assert find_utils._get_subpath_value_wildcard(obj, target_path, ["x", "y"]) == [
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
        "qualibrate.api.core.utils.find_utils._get_subpath_value_wildcard",
        return_value=[{"k": "v"}],
    )
    assert get_subpath_value({"x": "v"}, ["*", 1], None) == [{"k": "v"}]
    mocked_wildcard.assert_called_once_with({"x": "v"}, ["*", 1], [])


def test_get_subpath_value_invalid_key_or_index(mocker):
    mocked_wildcard = mocker.patch(
        "qualibrate.api.core.utils.find_utils._get_subpath_value_wildcard",
    )
    mocked_check = mocker.patch(
        "qualibrate.api.core.utils.find_utils._check_key_valid",
        return_value=False,
    )
    assert get_subpath_value({}, ["path"], None) == []
    mocked_wildcard.assert_not_called()
    mocked_check.assert_called_once_with({}, "path")


@pytest.mark.parametrize("obj, key", [({"a": 1}, "a"), ([1], 0)])
def test_get_subpath_value_final_target_key(mocker, obj, key):
    mocked_wildcard = mocker.patch(
        "qualibrate.api.core.utils.find_utils._get_subpath_value_wildcard",
    )
    mocked_check = mocker.patch(
        "qualibrate.api.core.utils.find_utils._check_key_valid",
        return_value=True,
    )
    assert get_subpath_value(obj, [key], None) == [{"key": [key], "value": 1}]
    mocked_wildcard.assert_not_called()
    mocked_check.assert_called_once_with(obj, key)


@pytest.mark.parametrize("obj, key", [({"a": {"k": 1}}, "a"), ([{"k": 1}], 0)])
def test_get_subpath_value_list_target_key(mocker, obj, key):
    mocked_wildcard = mocker.patch(
        "qualibrate.api.core.utils.find_utils._get_subpath_value_wildcard",
    )
    mocked_check = mocker.patch(
        "qualibrate.api.core.utils.find_utils._check_key_valid",
        return_value=True,
    )
    mocked_recursive = mocker.patch(
        "qualibrate.api.core.utils.find_utils.get_subpath_value",
        return_value=["a"],
    )
    assert get_subpath_value(obj, [key, "k"], None) == ["a"]
    mocked_wildcard.assert_not_called()
    mocked_check.assert_called_once_with(obj, key)
    mocked_recursive.assert_called_once_with({"k": 1}, ["k"], [key])
