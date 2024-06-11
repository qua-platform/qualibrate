from pathlib import Path

import pytest

from qualibrate_app.api.core.domain.local_storage import _id_to_local_path
from qualibrate_app.api.core.utils.singleton import Singleton
from qualibrate_app.api.exceptions.classes.storage import QFileNotFoundException


def test_default_node_path_solver_exists_root(tmp_path: Path):
    date_path = tmp_path / "date_path"
    date_path.mkdir()
    first = date_path / "#1_aaa"
    first.mkdir()
    second = date_path / "#2_bbb"
    second.mkdir()
    assert _id_to_local_path.default_node_path_solver(1, tmp_path) == first
    assert _id_to_local_path.default_node_path_solver(2, tmp_path) == second


@pytest.mark.skip(reason="Now we use only non recursive nodes structure")
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


class Test_IdToProjectLocalPath:
    @pytest.fixture(autouse=True, scope="function")
    def create_id2project_node(self):
        self.id2project_node = _id_to_local_path._IdToProjectLocalPath("name", None)

    def test_get_item_already_exists(self, mocker):
        self.id2project_node._mapping.update({1: "some_path"})
        solver_patched = mocker.patch(
            (
                "qualibrate.api.core.domain.local_storage._id_to_local_path"
                ".default_node_path_solver"
            ),
        )
        assert self.id2project_node.get(1) == "some_path"
        solver_patched.assert_not_called()

    def test_get_item_successfully_solved(self, mocker):
        solver_patched = mocker.patch(
            (
                "qualibrate.api.core.domain.local_storage._id_to_local_path"
                ".default_node_path_solver"
            ),
            return_value="some_path",
        )
        mocker.patch.object(
            _id_to_local_path._IdToProjectLocalPath.get,
            "__defaults__",
            (solver_patched,),
        )
        assert 1 not in self.id2project_node._mapping
        assert self.id2project_node.get(1) == "some_path"
        assert 1 in self.id2project_node._mapping
        solver_patched.assert_called_once_with(1, None)

    def test_get_path_not_found(self, mocker):
        solver_patched = mocker.patch(
            (
                "qualibrate.api.core.domain.local_storage._id_to_local_path"
                ".default_node_path_solver"
            ),
            return_value=None,
        )
        mocker.patch.object(
            _id_to_local_path._IdToProjectLocalPath.get,
            "__defaults__",
            (solver_patched,),
        )
        assert 1 not in self.id2project_node._mapping
        assert self.id2project_node.get(1) is None
        assert 1 not in self.id2project_node._mapping
        solver_patched.assert_called_once_with(1, None)


class TestIdToLocalPath:
    @pytest.fixture(autouse=True, scope="function")
    def clean_id_to_local_path(self):
        self.id2lp = _id_to_local_path.IdToLocalPath()
        yield
        Singleton._clear()

    def test_get_from_new_project(self, mocker):
        patched_id2plp = mocker.patch(
            (
                "qualibrate.api.core.domain.local_storage._id_to_local_path"
                "._IdToProjectLocalPath"
            )
        )
        patched_id2plp.return_value.get.return_value = "some_path"
        assert self.id2lp._project_to_path == {}
        assert self.id2lp.get("project", 1, "path") == "some_path"
        assert tuple(self.id2lp._project_to_path.keys()) == ("project",)
        patched_id2plp.assert_called_once_with("project", "path")

    def test_get_existing_project(self, mocker):
        p2plp = mocker.MagicMock()
        p2plp.get.return_value = "some_path"
        self.id2lp._project_to_path = {"project": p2plp}
        patched_id2plp = mocker.patch(
            (
                "qualibrate.api.core.domain.local_storage._id_to_local_path"
                "._IdToProjectLocalPath"
            )
        )
        assert self.id2lp.get("project", 1, "path") == "some_path"
        assert tuple(self.id2lp._project_to_path.keys()) == ("project",)
        patched_id2plp.assert_not_called()

    def test_get_or_raise_path_is_none(self, mocker):
        patched_get = mocker.patch.object(self.id2lp, "get", return_value=None)
        with pytest.raises(QFileNotFoundException) as ex:
            self.id2lp.get_or_raise("project", 1, "path")
        assert ex.type == QFileNotFoundException
        assert ex.value.args == ("Node 1 of project 'project' not found",)
        patched_get.assert_called_once_with(
            "project", 1, "path", _id_to_local_path.default_node_path_solver
        )

    def test_get_or_raise_path_is_not_none(self, mocker):
        patched_get = mocker.patch.object(self.id2lp, "get", return_value="node_path")
        assert self.id2lp.get_or_raise("project", 1, "path") == "node_path"
        patched_get.assert_called_once_with(
            "project", 1, "path", _id_to_local_path.default_node_path_solver
        )
