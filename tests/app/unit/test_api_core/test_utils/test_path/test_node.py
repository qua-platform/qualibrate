from datetime import time
from unittest.mock import PropertyMock

import pytest

from qualibrate.app.api.core.utils.path.node import NodePath
from qualibrate.app.api.core.utils.path.node_date import NodesDatePath


class TestNodePath:
    def test_date_path(self):
        node = NodePath("/some/path/to/dir")
        assert node.date_path == NodesDatePath(node.parent)

    def test_date(self, mocker):
        node = NodePath("/some/path/to/dir")
        mocker.patch.object(
            node.__class__,
            "date_path",
            new_callable=PropertyMock,
            return_value=type("MockDate", (), {"date": "2024-04-27"}),
        )
        assert node.date == "2024-04-27"

    def test_datetime(self, mocker):
        node = NodePath("/some/path/to/dir")
        mocker.patch.object(
            node.__class__,
            "date_path",
            new_callable=PropertyMock,
            return_value=type(
                "MockDate", (), {"datetime": "2024-04-27T12:00:00"}
            ),
        )
        assert node.datetime == "2024-04-27T12:00:00"

    @pytest.mark.parametrize("stem", ("no-underscore", "single_underscode"))
    def test_get_node_id_name_time_less_parts(self, stem):
        node = NodePath(f"/some/path/to/{stem}")
        assert node.get_node_id_name_time() == (None, stem, None)

    def test_get_node_id_name_time_id_not_starts_with_hash(self):
        stem = "11_name_120000"
        node = NodePath(f"/some/path/to/{stem}")
        assert node.get_node_id_name_time() == (None, stem, None)

    def test_get_node_id_name_time_id_not_numeric(self):
        stem = "#1a_name_120000"
        node = NodePath(f"/some/path/to/{stem}")
        assert node.get_node_id_name_time() == (None, stem, None)

    @pytest.mark.parametrize("name", ("no-underscore", "has_underscode"))
    def test_get_node_id_name_time_valid(self, name):
        stem = f"#11_{name}_120000"
        node = NodePath(f"/some/path/to/{stem}")
        assert node.get_node_id_name_time() == (
            11,
            name,
            time(12, 0, 0),
        )

    @pytest.mark.parametrize(
        "attr, value",
        [("id", 2), ("node_name", "name"), ("time", time(12, 0, 0))],
    )
    def test_id(self, mocker, attr, value):
        node = NodePath("/some/#2_node_name_120000")
        mocker.patch.object(
            node.__class__,
            "get_node_id_name_time",
            return_value=(2, "name", time(12, 0, 0)),
        )
        assert getattr(node, attr) == value
