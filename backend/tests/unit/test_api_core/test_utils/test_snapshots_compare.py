import pytest

from qualibrate.api.core.utils.snapshots_compare import jsonpatch_to_mapping


def test_jsonpatch_to_mapping_empty():
    assert jsonpatch_to_mapping({}, []) == {}


# TODO: add tests with None
@pytest.mark.parametrize(
    "original, patch, expected",
    [
        (
            {"q3": "empty"},
            [{"op": "move", "from": "/q3", "path": "/q4"}],
            {"/q3": {"old": "empty"}, "/q4": {"new": "empty"}},
        ),
        (
            {"q2": {"frequency": 3, "values": [5, 6]}},
            [{"op": "copy", "from": "/q2", "path": "/q5"}],
            {"/q5": {"new": {"frequency": 3, "values": [5, 6]}}},
        ),
        (
            {"q1": {"frequency": 2, "values": "string"}},
            [{"op": "remove", "path": "/q1/values"}],
            {"/q1/values": {"old": "string"}},
        ),
        (
            {"q0": {"frequency": 1, "values": [1, 2, 3]}},
            [{"op": "replace", "path": "/q0/frequency", "value": 1.1}],
            {"/q0/frequency": {"old": 1, "new": 1.1}},
        ),
        (
            {"q2": {"frequency": 3, "values": [5, 6]}},
            [{"op": "add", "path": "/q2/values/2", "value": 4}],
            {"/q2/values/2": {"new": 4}},
        ),
    ],
)
def test_jsonpatch_to_mapping(original, patch, expected):
    assert jsonpatch_to_mapping(original, patch) == expected
