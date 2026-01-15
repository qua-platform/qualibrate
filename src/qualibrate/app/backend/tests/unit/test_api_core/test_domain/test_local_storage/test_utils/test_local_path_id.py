import pytest

from qualibrate_app.api.core.domain.local_storage.utils import (  # noqa: E501
    local_path_id,
    project_local_path_id,
)
from qualibrate_app.api.core.utils.singleton import Singleton
from qualibrate_app.api.exceptions.classes.storage import QFileNotFoundException


class TestIdToLocalPath:
    @pytest.fixture(autouse=True, scope="function")
    def clean_local_path_id(self):
        self.id2lp = local_path_id.IdToLocalPath()
        yield
        Singleton._clear()

    def test_get_project_manager_create_new(self, mocker):
        patched_id2plp = mocker.patch(
            "qualibrate_app.api.core.domain.local_storage.utils.local_path_id.IdToProjectLocalPath",
            autospec=True,
        )
        id2plp = self.id2lp.get_project_manager("project", "path")
        patched_id2plp.assert_called_once_with("project", "path")
        assert id2plp == patched_id2plp.return_value

    def test_get_project_manager_existing(self, mocker):
        id2plp = mocker.patch(
            "qualibrate_app.api.core.domain.local_storage.utils.local_path_id."
            "IdToProjectLocalPath",
        )
        self.id2lp._project_to_manager["project2"] = "plp_proj2"
        assert self.id2lp.get_project_manager("project2", "path") == "plp_proj2"
        id2plp.assert_not_called()

    def test_get_path(self, mocker):
        patched_id2plp = mocker.MagicMock(
            spec=project_local_path_id.IdToProjectLocalPath
        )
        patched_id2plp.get_path.return_value = "some_path"
        patched_get_manager = mocker.patch.object(
            self.id2lp, "get_project_manager", return_value=patched_id2plp
        )
        assert self.id2lp._project_to_manager == {}
        assert self.id2lp.get_path("project", 1, "path") == "some_path"
        patched_get_manager.assert_called_once_with("project", "path")
        patched_id2plp.get_path.assert_called_once_with(1)

    def test_get_path_or_raise_path_is_none(self, mocker):
        patched_get = mocker.patch.object(
            self.id2lp, "get_path", return_value=None
        )
        with pytest.raises(QFileNotFoundException) as ex:
            self.id2lp.get_path_or_raise("project", 1, "path")
        assert ex.type == QFileNotFoundException
        assert ex.value.args == ("Node 1 of project 'project' not found",)
        patched_get.assert_called_once_with("project", 1, "path")

    def test_get_or_raise_path_is_not_none(self, mocker):
        patched_get = mocker.patch.object(
            self.id2lp, "get_path", return_value="node_path"
        )
        assert self.id2lp.get_path_or_raise("project", 1, "path") == "node_path"
        patched_get.assert_called_once_with("project", 1, "path")
