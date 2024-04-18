from pathlib import Path

import pytest

from qualibrate.api.core.domain.local_storage import _id_to_local_path
from qualibrate.api.core.utils.singleton import Singleton
from qualibrate.api.exceptions.classes.storage import QFileNotFoundException


def test_default_node_path_solver_exists_root(tmp_path: Path):
    first = tmp_path / "#1_aaa"
    first.mkdir()
    second = tmp_path / "#2_bbb"
    second.mkdir()
    assert _id_to_local_path.default_node_path_solver(1, tmp_path) == first
    assert _id_to_local_path.default_node_path_solver(2, tmp_path) == second


def test_default_node_path_solver_exists_subpath(tmp_path: Path):
    first = tmp_path / "#1_aaa"
    second = first / "#2_bbb"
    third = second / "#3_ccc"
    third.mkdir(parents=True)
    assert _id_to_local_path.default_node_path_solver(2, tmp_path) == second
    assert _id_to_local_path.default_node_path_solver(3, tmp_path) == third


def test_default_node_path_solver_not_exists(tmp_path: Path):
    first = tmp_path / "#1_aaa"
    second = first / "#2_bbb"
    second.mkdir(parents=True)
    assert _id_to_local_path.default_node_path_solver(3, tmp_path) is None


class TestIdToLocalPath:
    @pytest.fixture(autouse=True, scope="function")
    def clean_id_to_local_path(self):
        Singleton._clear()

    def test_get_path_exists(self, mocker):
        base_path = None
        id_ = 1
        node_path = "path"
        solver_patched = mocker.patch(
            (
                "qualibrate.api.core.domain.local_storage._id_to_local_path"
                ".default_node_path_solver"
            ),
            return_value=node_path,
        )
        mocker.patch.object(
            _id_to_local_path.IdToLocalPath.get,
            "__defaults__",
            (solver_patched,),
        )
        mapping = _id_to_local_path.IdToLocalPath(base_path)
        solver_patched.assert_not_called()
        assert mapping._mapping == {}
        path = mapping.get(id_)
        assert path == node_path
        solver_patched.assert_called_once_with(id_, base_path)
        assert mapping._mapping == {id_: node_path}
        # verify that value got from mapping
        path2 = mapping.get(id_)
        assert path2 == node_path
        solver_patched.assert_called_once_with(id_, base_path)
        assert mapping._mapping == {id_: node_path}

    def test_get_path_not_exists(self, mocker):
        base_path = None
        id_ = 1
        solver_patched = mocker.patch(
            (
                "qualibrate.api.core.domain.local_storage._id_to_local_path"
                ".default_node_path_solver"
            ),
            return_value=None,
        )
        mocker.patch.object(
            _id_to_local_path.IdToLocalPath.get,
            "__defaults__",
            (solver_patched,),
        )
        mapping = _id_to_local_path.IdToLocalPath(base_path)
        solver_patched.assert_not_called()
        assert mapping._mapping == {}
        path = mapping.get(id_)
        assert path is None
        solver_patched.assert_called_once_with(id_, base_path)
        assert mapping._mapping == {}
        path2 = mapping.get(id_)
        assert path2 is None
        assert solver_patched.call_count == 2
        solver_patched.assert_called_with(id_, base_path)
        assert mapping._mapping == {}

    def test_getitem_item_exists(self, mocker):
        get_patched = mocker.patch.object(
            _id_to_local_path.IdToLocalPath,
            "get",
            return_value="path",
        )
        mapping = _id_to_local_path.IdToLocalPath(None)
        assert mapping[1] == "path"
        get_patched.assert_called_once_with(1)

    def test_getitem_item_not_exists(self, mocker):
        mocker.patch.object(
            _id_to_local_path.IdToLocalPath,
            "get",
            return_value=None,
        )
        mapping = _id_to_local_path.IdToLocalPath(None)
        with pytest.raises(QFileNotFoundException) as ex:
            mapping[1]
        assert ex.type == QFileNotFoundException
        assert ex.value.args == ("Node 1 not found",)
