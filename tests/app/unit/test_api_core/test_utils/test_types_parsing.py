import pytest

from qualibrate_app.api.core.utils import types_parsing


@pytest.mark.parametrize(
    "data, expected",
    (
        (True, True),
        (False, False),
        ("true", True),
        ("false", False),
        ("random", "random"),
        (1, True),
        (-2, True),
        (0, False),
        (-1e-8, True),
        (1e-8, True),
        (1e-10, False),
        (-1e-10, False),
        (0.0, False),
        (b"random", b"random"),
    ),
)
def test_parse_bool(data, expected):
    if isinstance(expected, bool):
        assert types_parsing.parse_bool(data) is expected
    else:
        assert types_parsing.parse_bool(data) == expected


@pytest.mark.parametrize(
    "data, expected",
    (
        (True, 1),
        (False, 0),
        (10, 10),
        ("2", 2),
        ("-3", -3),
        ("random", "random"),
        (1.0, 1),
        (1.1, 1.1),
        (b"random", b"random"),
    ),
)
def test_parse_int(data, expected):
    assert types_parsing.parse_int(data) == expected


@pytest.mark.parametrize(
    "data, expected",
    (
        (1.0, 1.0),
        (1, 1.0),
        ("2", 2.0),
        ("-3", -3.0),
        ("random", "random"),
        (b"random", b"random"),
    ),
)
def test_parse_float(data, expected):
    assert types_parsing.parse_float(data) == expected


@pytest.mark.parametrize(
    "data, expected",
    (
        (1.0, 1.0),
        (1, 1),
        ("2", "2"),
        ("-3", "-3"),
        ("true", "true"),
        ("random", "random"),
        (b"random", b"random"),
    ),
)
def test_parse_str(data, expected):
    assert types_parsing.parse_str(data) == expected


@pytest.mark.parametrize(
    "data, expected",
    (
        (None, None),
        ("", None),
        (0, 0),
        ("0", "0"),
        ("none", "none"),
        ("null", "null"),
        ("random", "random"),
        (b"random", b"random"),
    ),
)
def test_parse_none(data, expected):
    if expected is None:
        assert types_parsing.parse_none(data) is None
    else:
        assert types_parsing.parse_none(data) == expected


def test_parse_typed_list_empty(mocker):
    patched = mocker.patch("builtins.map")
    assert types_parsing.parse_typed_list([], int) == []
    patched.assert_not_called()


@pytest.mark.parametrize(
    "input_list, item_type",
    (
        (["1", "2", "3"], int),
        (["1.2", "2.2", "3.3"], float),
        ([True, "false"], bool),
        (["aaa"], str),
        (["", None], types_parsing.NoneType),
    ),
)
def test_parse_typed_list_non_empty(mocker, input_list, item_type):
    mocked = mocker.MagicMock()
    mocker.patch.dict(types_parsing.BASIC_PARSERS, {item_type: mocked})
    types_parsing.parse_typed_list(input_list, item_type)
    assert mocked.mock_calls == [mocker.call(i) for i in input_list]


def test_parse_typed_list_raise_error(mocker):
    mocked = mocker.MagicMock(side_effect=ValueError)
    mocker.patch.dict(types_parsing.BASIC_PARSERS, {int: mocked})
    assert types_parsing.parse_typed_list([1, 2], int) == [1, 2]


def test__parse_list_no_item_type():
    lst = [1, 2, "a"]
    assert types_parsing._parse_list(lst, types_parsing._missing) == lst


def test__parse_list_with_item_type(mocker):
    lst = ["1", "2", "a"]
    patched = mocker.patch(
        "qualibrate_app.api.core.utils.types_parsing.parse_typed_list",
        return_value="value",
    )
    assert types_parsing._parse_list(lst, int) == "value"
    patched.assert_called_once_with(lst, int)


def test_parse_list_list(mocker):
    lst = ["1", "2", "a"]
    patched = mocker.patch(
        "qualibrate_app.api.core.utils.types_parsing._parse_list",
        return_value="value",
    )
    assert types_parsing.parse_list(lst, int) == "value"
    patched.assert_called_once_with(lst, int)


@pytest.mark.parametrize(
    "brackets, join",
    (
        (False, ","),
        (False, ", "),
        (True, ","),
        (True, ", "),
    ),
)
def test_parse_list_str(mocker, brackets, join):
    lst = ["1", "2", "a"]
    in_str = (
        f"{'[' if brackets else ''}{join.join(lst)}{']' if brackets else ''}"
    )
    patched = mocker.patch(
        "qualibrate_app.api.core.utils.types_parsing._parse_list",
        return_value="value",
    )
    assert types_parsing.parse_list(in_str, int) == "value"
    patched.assert_called_once_with(lst, int)


@pytest.mark.parametrize("data", (1, False, 1.1, b"aaa"))
def test_parse_list_other_types(mocker, data):
    patched = mocker.patch(
        "qualibrate_app.api.core.utils.types_parsing._parse_list",
        return_value="value",
    )
    assert types_parsing.parse_list(data, int) == data
    patched.assert_not_called()


@pytest.fixture
def types_schema():
    return {
        "str_val": {
            "anyOf": [{"type": "string"}, {"type": "null"}],
        },
        "list_str": {
            "items": {"type": "string"},
            "type": "array",
        },
        "float_val": {"type": "number"},
        "list_float": {
            "items": {"type": "number"},
            "type": "array",
        },
        "int_val": {"type": "integer"},
        "list_int": {
            "items": {"type": "integer"},
            "type": "array",
        },
        "bool_val": {"type": "boolean"},
        "list_bool": {
            "items": {"type": "boolean"},
            "type": "array",
        },
        "none_val": {"type": "null"},
    }


@pytest.mark.parametrize(
    "input_data, expected",
    (
        (
            {
                "str_val": "aaa",
                "list_str": "[aa, bb]",
                "float_val": "1.2",
                "list_float": ["1.2", "1.3"],
                "int_val": "-1111111",
                "list_int": [1, 2, 3],
                "bool_val": False,
                "list_bool": "[true, false]",
                "none_val": "",
            },
            {
                "str_val": "aaa",
                "list_str": ["aa", "bb"],
                "float_val": 1.2,
                "list_float": [1.2, 1.3],
                "int_val": -1111111,
                "list_int": [1, 2, 3],
                "bool_val": False,
                "list_bool": [True, False],
                "none_val": None,
            },
        ),
        (
            {
                "str_val": "aaa",
                "list_str": "aa, bb",
                "float_val": "1e-2",
                "list_float": "1.2,1.3",
                "int_val": "0",
                "list_int": "[1, 2, 3]",
                "bool_val": "false",
                "list_bool": "[true, false]",
                "none_val": None,
            },
            {
                "str_val": "aaa",
                "list_str": ["aa", "bb"],
                "float_val": 0.01,
                "list_float": [1.2, 1.3],
                "int_val": 0,
                "list_int": [1, 2, 3],
                "bool_val": False,
                "list_bool": [True, False],
                "none_val": None,
            },
        ),
    ),
)
def test_types_conversion(types_schema, input_data, expected):
    assert types_parsing.types_conversion(input_data, types_schema) == expected
