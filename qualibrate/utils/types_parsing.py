# duplication of qualibrate_runner/core/types_parsing.py

import sys
from collections.abc import Mapping
from typing import Any, Optional, Union

if sys.version_info >= (3, 10):
    from types import NoneType
else:
    NoneType = type(None)

NOT_NONE_BASIC_TYPES = Union[bool, int, float, str]
BASIC_TYPES = Union[NOT_NONE_BASIC_TYPES, NoneType]
LIST_TYPES = Union[list[bool], list[int], list[float], list[str]]
VALUE_TYPES_WITHOUT_REC = Union[BASIC_TYPES, LIST_TYPES]
INPUT_CONVERSION_TYPE = Union[
    VALUE_TYPES_WITHOUT_REC, dict[str, "INPUT_CONVERSION_TYPE"]
]


def parse_bool(value: VALUE_TYPES_WITHOUT_REC) -> VALUE_TYPES_WITHOUT_REC:
    """
    Parses a value into a boolean if possible.

    Args:
        value: The input value to parse.

    Returns:
        - A boolean value if the input is convertible to boolean.
        - The original value if it cannot be parsed into a boolean.
    """
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        if value.lower() == "true":
            return True
        if value.lower() == "false":
            return False
        return value
    if isinstance(value, int):
        return value != 0
    if isinstance(value, float):
        return abs(value) > 1e-9
    return value


def parse_int(value: VALUE_TYPES_WITHOUT_REC) -> VALUE_TYPES_WITHOUT_REC:
    """
    Parses a value into an integer if possible.

    Args:
        value: The input value to parse.

    Returns:
        - An integer if the input is convertible to an integer.
        - The original value if it cannot be parsed into an integer.
    """
    if isinstance(value, bool):
        return int(value)
    if isinstance(value, int):
        return value
    if isinstance(value, str):
        if value.isdigit() or (
            len(value) > 1 and value[0] == "-" and value[1:].isdigit()
        ):
            return int(value)
        return value
    if isinstance(value, float):
        if value.is_integer():
            return int(value)
        return value
    return value


def parse_float(value: VALUE_TYPES_WITHOUT_REC) -> VALUE_TYPES_WITHOUT_REC:
    """
    Parses a value into a float if possible.

    Args:
        value: The input value to parse.

    Returns:
        - A float if the input is convertible to a float.
        - The original value if it cannot be parsed into a float.
    """
    if isinstance(value, float):
        return value
    if isinstance(value, int):
        return float(value)
    if isinstance(value, str):
        try:
            return float(value)
        except ValueError:
            return value
    return value


def parse_str(value: VALUE_TYPES_WITHOUT_REC) -> VALUE_TYPES_WITHOUT_REC:
    """
    Parses a value into a string, removing surrounding quotes if present.

    Args:
        value: The input value to parse.

    Returns:
        - A string with surrounding quotes removed if the input is a quoted
          string.
        - The original value if no parsing is required.
    """
    if (
        isinstance(value, str)
        and len(value) > 1
        and (
            (value.startswith('"') and value.endswith('"'))
            or (value.startswith("'") and value.endswith("'"))
        )
    ):
        return value[1:-1]
    return value


def parse_none(value: VALUE_TYPES_WITHOUT_REC) -> VALUE_TYPES_WITHOUT_REC:
    """
    Parses a value into None if applicable.

    Args:
        value: The input value to parse.

    Returns:
        - None if the input is None or an empty string.
        - The original value if no parsing is required.
    """
    if value is None or (isinstance(value, str) and not value):
        return None
    return value


BASIC_PARSERS = {
    int: parse_int,
    float: parse_float,
    bool: parse_bool,
    str: parse_str,
    NoneType: parse_none,
}

STR_TO_TYPE: Mapping[str, type[BASIC_TYPES]] = {
    "integer": int,
    "number": float,
    "boolean": bool,
    "string": str,
    "null": NoneType,
}


def parse_typed_list(
    value: list[Any], item_type: type[BASIC_TYPES]
) -> LIST_TYPES:
    """
    Parses a list, converting each element to a specified type.

    Args:
        value: The input list to parse.
        item_type: The type to which each element in the list should be
            converted.

    Returns:
        A list with each element converted to the specified type, or the
            original list if conversion fails.
    """
    if len(value) == 0:
        return value
    parser = BASIC_PARSERS[item_type]
    try:
        return list(map(parser, value))  # type: ignore
    except ValueError:
        return value


def parse_list(
    value: VALUE_TYPES_WITHOUT_REC,
    item_type: Optional[type[BASIC_TYPES]],
) -> VALUE_TYPES_WITHOUT_REC:
    """
    Parses a value into a list, optionally converting elements to a specified
    type.

    Args:
        value: The input value to parse. Can be a list or a string
            representation of a list.
        item_type: The type to which each element in the list should be
            converted, or None to skip type conversion.

    Returns:
        A parsed list with optionally converted elements, or the original value
        if parsing is not possible.
    """
    if isinstance(value, list):
        if item_type is None:
            return value
        return parse_typed_list(value, item_type)
    if isinstance(value, str):
        stripped = value.strip()
        if stripped.startswith("[") and stripped.endswith("]"):
            stripped = stripped[1:-1]
        splitted = list(map(str.strip, stripped.split(",")))
        if item_type is None:
            return splitted
        return parse_typed_list(splitted, item_type)
    return value


def types_conversion(value: Any, expected_type: Mapping[str, Any]) -> Any:
    """
    Recursively converts a value to match the expected type.

    Args:
        value: The input value to convert.
        expected_type: A mapping that describes the expected type or schema,
            including possible nested structures.

    Returns:
        The converted value matching the expected type or schema, or the
        original value if no conversion is applicable.
    """
    if isinstance(value, Mapping):
        # has sub items
        new = {}
        for k, v in value.items():
            if k in expected_type:
                new[k] = types_conversion(v, expected_type[k])
            else:
                new[k] = v
        return new
    if "anyOf" in expected_type:
        # suppose that only `type | None` is possible
        none = parse_none(value)
        if none is None:
            return None
        expected_type_ = dict(expected_type)
        expected_type_["type"] = expected_type_.pop("anyOf")[0]["type"]
        return types_conversion(value, expected_type_)
    if "type" in expected_type:
        if expected_type.get("type") == "array":
            # array
            item_type: Optional[type[BASIC_TYPES]] = (
                STR_TO_TYPE.get(expected_type["items"]["type"])
                if "items" in expected_type
                else None
            )
            return parse_list(value, item_type)
        if expected_type.get("type") in STR_TO_TYPE:
            expected = STR_TO_TYPE[expected_type["type"]]
            parser = BASIC_PARSERS[expected]
            return parser(value)
    return value
