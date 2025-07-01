from datetime import date
from pathlib import Path
from types import SimpleNamespace

import pytest

from qualibrate_app.api.core.domain.local_storage.utils import (
    project_local_path_id,
)
from qualibrate_app.api.core.types import (
    SearchWithIdFilter,
)


def test_creation(mocker):
    patched_fill_full = mocker.patch.object(
        project_local_path_id.IdToProjectLocalPath, "_fill_full"
    )
    instance = project_local_path_id.IdToProjectLocalPath(
        "test", "project_path"
    )
    assert instance._project_name == "test"
    assert instance._project_path == "project_path"
    patched_fill_full.assert_called_once()


class TestIdToProjectLocalPath:
    @pytest.fixture
    def fake_node(self):
        return SimpleNamespace(
            id=1, date=date(2025, 6, 1), node_name="alpha_node"
        )

    @pytest.fixture(autouse=True, scope="function")
    def create_id2plp(self, tmp_path):
        self.id2plp = project_local_path_id.IdToProjectLocalPath(
            "project", tmp_path
        )

    @pytest.fixture
    def instance_with_node(self, fake_node, mocker, tmp_path):
        mocker.patch(
            "qualibrate_app.api.core.domain.local_storage.utils.project_local_path_id.NodePath",
            return_value=fake_node,
        )
        inst = project_local_path_id.IdToProjectLocalPath("test", tmp_path)
        inst._id2path.update({1: fake_node})
        inst._name2id.update({"alpha_node": [1]})
        inst._date2id.update({fake_node.date: [1]})
        inst._size = 1
        return inst

    def test__add_node_skips_none_id(self, tmp_path):
        node = SimpleNamespace(id=None, date=date.today(), node_name="test")
        self.id2plp._add_node(node)
        assert len(self.id2plp._id2path) == 0

    def test__add_node_valid(self, tmp_path):
        node = SimpleNamespace(id=2, date=date.today(), node_name="test")
        self.id2plp._add_node(node)
        assert self.id2plp._id2path[node.id] == node
        assert node.id in self.id2plp._name2id[node.node_name]
        assert node.id in self.id2plp._date2id[node.date]

    def test__fill_full(self, mocker, tmp_path):
        node_dirs = [
            tmp_path.joinpath("2025-06-01", "#1_a_120000"),
            tmp_path.joinpath("2025-06-01", "#2_b_130000"),
            tmp_path.joinpath("2025-06-02", "#3_c_120000"),
            tmp_path.joinpath("2025-06-03", "#4_a_120000"),
        ]
        for node_dir in node_dirs:
            node_dir.mkdir(parents=True)
        patched_glob = mocker.patch("pathlib.Path.glob", return_value=node_dirs)
        patched_node_path = mocker.patch(
            "qualibrate_app.api.core.domain.local_storage.utils."
            "project_local_path_id.NodePath",
            side_effect=lambda p: p,
        )
        patched_add_node = mocker.patch.object(self.id2plp, "_add_node")
        self.id2plp._fill_full()
        patched_glob.assert_called_once_with("*/#*")
        node_dirs_calls = [mocker.call(p) for p in node_dirs]
        patched_node_path.assert_has_calls(node_dirs_calls)
        patched_add_node.assert_has_calls(node_dirs_calls)

    def test__fill_date_today_no_dir(self, mocker):
        patched_date = mocker.patch(
            (
                "qualibrate_app.api.core.domain.local_storage.utils."
                "project_local_path_id.date"
            ),
            wraps=date,
        )
        patched_glob = mocker.patch("pathlib.Path.glob")
        self.id2plp._fill_date()
        patched_date.today.assert_called_once()
        patched_glob.assert_not_called()

    def test__fill_date_specific_date_add_new(self, mocker, tmp_path):
        dt = date(2025, 6, 1)
        dt_str = dt.isoformat()
        self.id2plp._date2id[dt] = [1, 2]
        node_dirs = [
            tmp_path.joinpath(dt_str, "#1_a_120000"),
            tmp_path.joinpath(dt_str, "#2_b_130000"),
            tmp_path.joinpath(dt_str, "#3_c_130000"),
            tmp_path.joinpath(dt_str, "#4_a_130000"),
        ]
        for node_dir in node_dirs:
            node_dir.mkdir(parents=True)
        patched_project_path = mocker.patch.object(
            self.id2plp, "_project_path", spec=Path
        )
        dt_dir_patched = mocker.MagicMock(spec=Path)
        patched_project_path.__truediv__.return_value = dt_dir_patched
        dt_dir_patched.glob.return_value = node_dirs
        nodes = [
            SimpleNamespace(id=1, node_name="a", date=date.today()),
            SimpleNamespace(id=2, node_name="b", date=date.today()),
            SimpleNamespace(id=3, node_name="c", date=date.today()),
            SimpleNamespace(id=4, node_name="a", date=date.today()),
        ]
        patched_node_path = mocker.patch(
            "qualibrate_app.api.core.domain.local_storage.utils."
            "project_local_path_id.NodePath",
            side_effect=nodes,
        )
        patched_add_node = mocker.patch.object(self.id2plp, "_add_node")
        patched_date = mocker.patch(
            (
                "qualibrate_app.api.core.domain.local_storage.utils."
                "project_local_path_id.date"
            ),
            wraps=date,
        )
        self.id2plp._fill_date(date(2025, 6, 1))
        patched_date.today.assert_not_called()
        patched_project_path.__truediv__.assert_called_once_with(dt_str)
        dt_dir_patched.glob.assert_called_once_with("#*")

        patched_node_path.assert_has_calls([mocker.call(p) for p in node_dirs])
        patched_add_node.assert_has_calls(
            [
                mocker.call(
                    SimpleNamespace(id=3, node_name="c", date=date.today())
                ),
                mocker.call(
                    SimpleNamespace(id=4, node_name="a", date=date.today())
                ),
            ]
        )

    def test_get_path_exists(self):
        self.id2plp._id2path[1] = "some_path"
        assert self.id2plp.get_path(1) == "some_path"

    def test_get_path_not_exists(self):
        assert self.id2plp.get_path(1) is None

    def test__get_suited_ids_by_name_part(self, instance_with_node):
        assert instance_with_node._get_suited_ids_by_name_part("alpha") == {1}

    def test__get_suited_ids_by_name_part_empty(self, instance_with_node):
        assert instance_with_node._get_suited_ids_by_name_part("beta") == set()

    def test__get_suited_ids_by_date_valid(self, instance_with_node):
        ids = instance_with_node._get_suited_ids_by_date(
            date(2025, 1, 1), date(2025, 12, 31)
        )
        assert ids == {1}

    def test__get_suited_ids_by_date_invalid(self, instance_with_node):
        ids = instance_with_node._get_suited_ids_by_date(
            date(2025, 1, 1), date(2023, 1, 1)
        )
        assert ids == set()

    def test__get_suited_ids_by_id_range_exact_id(self, instance_with_node):
        assert instance_with_node._get_suited_ids_by_id_range(id=1) == {1}

    def test__get_suited_ids_by_id_range_not_found(self, instance_with_node):
        assert instance_with_node._get_suited_ids_by_id_range(id=999) == set()

    def test__get_suited_ids_by_id_range_min_max(self, instance_with_node):
        instance_with_node._id2path = {1: None, 2: None, 3: None}
        result = instance_with_node._get_suited_ids_by_id_range(
            min_id=2, max_id=3
        )
        assert result == {2, 3}

    def test__get_suited_ids_by_id_range_min_only(self, instance_with_node):
        instance_with_node._id2path = {1: None, 4: None}
        result = instance_with_node._get_suited_ids_by_id_range(min_id=2)
        assert result == {4}

    def test__get_suited_ids_by_id_range_max_only(self, instance_with_node):
        instance_with_node._id2path = {1: None, 4: None}
        result = instance_with_node._get_suited_ids_by_id_range(max_id=2)
        assert result == {1}

    def test_get_ids_without_filters(self, mocker):
        patched_fill_date = mocker.patch.object(self.id2plp, "_fill_date")
        patched_get_suited_ids = mocker.patch.object(
            self.id2plp, "_get_suited_ids_by_id_range", return_value={1}
        )
        assert self.id2plp.get_ids() == {1}
        patched_fill_date.assert_called_once()
        patched_get_suited_ids.assert_called_once_with()

    def test_get_ids_invalid_id_range(self, mocker):
        patched_fill_date = mocker.patch.object(self.id2plp, "_fill_date")
        patched_get_suited_ids = mocker.patch.object(
            self.id2plp, "_get_suited_ids_by_id_range"
        )
        filters = SearchWithIdFilter(min_node_id=10, max_node_id=1)
        assert self.id2plp.get_ids(filters) == set()
        patched_fill_date.assert_called_once()
        patched_get_suited_ids.assert_not_called()

    def test_get_ids_all_filters(self, mocker):
        patched_fill_date = mocker.patch.object(self.id2plp, "_fill_date")
        patched_get_suited_ids_by_name_part = mocker.patch.object(
            self.id2plp,
            "_get_suited_ids_by_name_part",
            return_value={1, 2, 3, 4, 5},
        )
        patched_get_suited_ids_by_date = mocker.patch.object(
            self.id2plp, "_get_suited_ids_by_date", return_value={2, 3, 4, 5, 6}
        )
        patched_get_suited_ids_by_id_range = mocker.patch.object(
            self.id2plp,
            "_get_suited_ids_by_id_range",
            return_value={3, 4, 5, 6, 7},
        )
        filters = SearchWithIdFilter(
            name_part="alpha",
            min_node_id=3,
            max_node_id=7,
            min_date=date(2025, 1, 1),
            max_date=date(2025, 12, 31),
        )
        assert self.id2plp.get_ids(filters) == {3, 4, 5}
        patched_fill_date.assert_called_once()
        patched_get_suited_ids_by_name_part.assert_called_once_with("alpha")
        patched_get_suited_ids_by_date.assert_called_once_with(
            date(2025, 1, 1), date(2025, 12, 31)
        )
        patched_get_suited_ids_by_id_range.assert_called_once_with(None, 3, 7)

    def test_get_ids_invalid_range(self, instance_with_node):
        filters = SearchWithIdFilter(min_node_id=5, max_node_id=2)
        assert instance_with_node.get_ids(filters) == set()

    def test_get_ids_no_filters(self, instance_with_node):
        assert instance_with_node.get_ids() == {1}

    def test_len(self):
        self.id2plp._id2path.update({1: None, 2: None, 3: None})
        assert len(self.id2plp) == 3

    def test_get_path_found(self, instance_with_node, fake_node):
        assert instance_with_node.get_path(1) == fake_node

    def test_get_path_not_found(self, instance_with_node):
        assert instance_with_node.get_path(999) is None

    def test_max_id_normal(self, instance_with_node):
        instance_with_node._id2path = {4: None, 1: None, 99: None}
        assert instance_with_node.max_id == 99

    def test_max_id_empty(self, instance_with_node):
        instance_with_node._id2path = {}
        assert instance_with_node.max_id == -1
