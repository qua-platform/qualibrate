import sys

if sys.version_info >= (3, 10):
    from types import NoneType
else:
    NoneType = type(None)
from typing import Any, Dict, List, Mapping, Optional, Type, Union

NOT_NONE_BASIC_TYPES = Union[bool, int, float, str]
BASIC_TYPES = Union[NOT_NONE_BASIC_TYPES, NoneType]
LIST_TYPES = Union[List[bool], List[int], List[float], List[str]]
VALUE_TYPES_WITHOUT_REC = Union[BASIC_TYPES, LIST_TYPES]
INPUT_CONVERSION_TYPE = Union[
    VALUE_TYPES_WITHOUT_REC, Dict[str, "INPUT_CONVERSION_TYPE"]
]


def parse_bool(value: VALUE_TYPES_WITHOUT_REC) -> VALUE_TYPES_WITHOUT_REC:
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
    return value


def parse_none(value: VALUE_TYPES_WITHOUT_REC) -> VALUE_TYPES_WITHOUT_REC:
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

STR_TO_TYPE: Mapping[str, Type[BASIC_TYPES]] = {
    "integer": int,
    "number": float,
    "boolean": bool,
    "string": str,
    "null": NoneType,
}


def parse_typed_list(
    value: List[Any], item_type: Type[BASIC_TYPES]
) -> LIST_TYPES:
    if len(value) == 0:
        return value
    parser = BASIC_PARSERS[item_type]
    try:
        return list(map(parser, value))  # type: ignore
    except ValueError:
        return value


def parse_list(
    value: VALUE_TYPES_WITHOUT_REC,
    item_type: Optional[Type[BASIC_TYPES]],
) -> VALUE_TYPES_WITHOUT_REC:
    if isinstance(value, List):
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
        # suppose that only `Type | None` is possible
        none = parse_none(value)
        if none is None:
            return None
        expected_type_ = dict(expected_type)
        expected_type_["type"] = expected_type_.pop("anyOf")[0]["type"]
        return types_conversion(value, expected_type_)
    if "type" in expected_type:
        if expected_type.get("type") == "array":
            # array
            item_type: Optional[Type[BASIC_TYPES]] = (
                STR_TO_TYPE.get(expected_type["items"]["type"])
                if "items" in expected_type
                else None
            )
            return parse_list(value, item_type)
        if expected_type.get("type") in STR_TO_TYPE.keys():
            expected = STR_TO_TYPE[expected_type["type"]]
            parser = BASIC_PARSERS[expected]
            return parser(value)
    return value


if __name__ == "__main__":
    types = {
        "targets_name": {
            "anyOf": [{"type": "string"}, {"type": "null"}],
            "default": None,
            "title": "Targets Name",
        },
        "str_val": {
            "anyOf": [{"type": "string"}, {"type": "null"}],
            "default": "a",
            "title": "Str Val",
        },
        "list_str": {
            "default": ["a", "b"],
            "items": {"type": "string"},
            "title": "List Str",
            "type": "array",
        },
        "float_val": {"default": 1.1, "title": "Float Val", "type": "number"},
        "list_float": {
            "default": ["a", "b"],
            "items": {"type": "number"},
            "title": "List Float",
            "type": "array",
        },
        "int_val": {"default": 100, "title": "Int Val", "type": "integer"},
        "list_int": {
            "default": ["a", "b"],
            "items": {"type": "integer"},
            "title": "List Int",
            "type": "array",
        },
        "bool_val": {"default": False, "title": "Bool Val", "type": "boolean"},
        "list_bool": {
            "default": ["a", "b"],
            "items": {"type": "boolean"},
            "title": "List Bool",
            "type": "array",
        },
        "none_val": {"default": None, "title": "None Val", "type": "null"},
    }
    types_conversion(
        {
            # "str_val": "aaa",
            # "list_str": "[aa, bb]",
            # "float_val": "1.2",
            # "list_float": ["1.2","1.3"],
            # "int_val": "-1111111",
            # "list_int": [1,2,3],
            # "bool_val": False,
            "list_bool": "[1, 0, True, False, true, false, 1.1, 0.0]",
            # "none_val": None
        },
        types,
    )
