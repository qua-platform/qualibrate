import json
from itertools import product
from pathlib import Path
from unittest.mock import PropertyMock

import pytest

from qualibrate_app.api.core.domain.bases.storage import (
    DataFileStorage,
    StorageLoadType,
)
from qualibrate_app.api.exceptions.classes.storage import QFileNotFoundException
from qualibrate_app.api.exceptions.classes.values import QValueException


def test_data_file_name():
    assert DataFileStorage.data_file_name == "data.json"


def test_storage_creation_path_not_exists(mocker, settings):
    node_path = settings.user_storage / "node_path"
    mocker.patch("pathlib.Path.is_dir", return_value=False)
    with pytest.raises(QFileNotFoundException) as ex:
        DataFileStorage(node_path, settings)
    assert ex.type == QFileNotFoundException
    assert ex.value.args == ("node_path does not exist.",)


def test_storage_creation_valid(mocker, settings):
    node_path = settings.user_storage / "node_path"
    mocker.patch("pathlib.Path.is_dir", return_value=True)
    dfs = DataFileStorage(node_path, settings=settings)
    assert dfs._path == node_path
    assert dfs._load_type == StorageLoadType.Empty
    assert dfs._data is None


class TestDataFileStorage:
    @pytest.fixture(autouse=True, scope="function")
    def create_dfs(self, settings):
        self.node_rel_path = Path("node_path")
        self.node_abs_path = settings.user_storage / self.node_rel_path
        self.node_abs_path.mkdir(parents=True)
        self.dfs = DataFileStorage(self.node_abs_path, settings)

    def test_path(self):
        assert self.dfs.path == self.node_rel_path

    def test_data_default(self):
        assert self.dfs.data is None

    def test_data_filled(self):
        self.dfs._data = {"k": "v"}
        assert self.dfs.data == {"k": "v"}

    def test_load_type_default(self):
        assert self.dfs.load_type == StorageLoadType.Empty

    def test_load_type_filled(self):
        self.dfs._load_type = StorageLoadType.Full
        assert self.dfs.load_type == StorageLoadType.Full

    @pytest.mark.parametrize(
        "load_type", [StorageLoadType.Empty, StorageLoadType.Full]
    )
    def test_load_current_type_greater_or_eq(self, mocker, load_type):
        mocker.patch.object(
            self.dfs.__class__,
            "load_type",
            new_callable=PropertyMock,
            return_value=StorageLoadType.Full,
        )
        patched_parse_data = mocker.patch.object(self.dfs, "_parse_data")
        assert self.dfs.load(load_type) is None
        patched_parse_data.assert_not_called()

    def test_load_call_parse(self, mocker):
        mocker.patch.object(
            self.dfs.__class__,
            "load_type",
            new_callable=PropertyMock,
            return_value=StorageLoadType.Empty,
        )
        patched_parse_data = mocker.patch.object(self.dfs, "_parse_data")
        assert self.dfs.load(StorageLoadType.Full) is None
        patched_parse_data.assert_called_once()

    def test_exists(self, mocker):
        patched_exists = mocker.patch("pathlib.Path.exists")
        self.dfs.exists()
        patched_exists.assert_called_once()

    @pytest.fixture
    def fill_dfs(self, create_dfs):
        names = [f"name_{i}" for i in range(3)]
        exts = [".txt", ".npy"]
        product_ = list(product(names, exts))
        for name, ext in product_:
            (self.node_abs_path / name).with_suffix(ext).touch()
        files = ["".join(parts) for parts in product_]
        yield list(sorted(files))

    def test_list_elements(self, fill_dfs):
        files = fill_dfs
        assert list(sorted(self.dfs.list_elements())) == files

    @pytest.mark.parametrize("ext", (".txt", ".npy"))
    def test_list_typed_elements_ext(self, fill_dfs, ext):
        files = list(sorted(filter(lambda x: x.endswith(ext), fill_dfs)))
        assert list(sorted(self.dfs.list_typed_elements(f"*{ext}"))) == files

    @pytest.mark.parametrize("name", ("name_0", "name_1", "name_2"))
    def test_list_typed_elements_name(self, fill_dfs, name):
        files = list(sorted(filter(lambda x: x.startswith(name), fill_dfs)))
        assert list(sorted(self.dfs.list_typed_elements(f"{name}*"))) == files

    def test__parse_data_no_file(self, mocker):
        patched_open = mocker.patch("pathlib.Path.open")
        mocker.patch("pathlib.Path.is_file", return_value=False)
        assert self.dfs._parse_data() is None
        patched_open.assert_not_called()

    def test__parse_data_empty_file(self):
        data_file = self.node_abs_path / self.dfs.__class__.data_file_name
        data_file.touch()
        with pytest.raises(QValueException) as ex:
            self.dfs._parse_data()
        assert ex.type == QValueException
        assert ex.value.args == ("Unexpected data format.",)

    def test__parse_data_invalid_content(self):
        data_file = self.node_abs_path / self.dfs.__class__.data_file_name
        data_file.write_text("[]")
        with pytest.raises(QValueException) as ex:
            self.dfs._parse_data()
        assert ex.type == QValueException
        assert ex.value.args == ("Unexpected data format.",)

    def test__parse_data_no_references(self, mocker):
        data_file = self.node_abs_path / self.dfs.__class__.data_file_name
        patched_resolve = mocker.patch("pathlib.Path.resolve")
        patched_suffix = mocker.patch(
            "pathlib.Path.suffix",
            new_callable=PropertyMock,
        )
        content = {"a": "b", "c": 2}
        data_file.write_text(json.dumps(content))
        assert self.dfs._parse_data() is None
        assert self.dfs._data == content
        assert self.dfs._load_type == StorageLoadType.Full
        patched_suffix.assert_called_once()
        patched_resolve.assert_not_called()

    def test__parse_data_reference_file_not_subpath_of_node(self, mocker):
        data_file = self.node_abs_path / self.dfs.__class__.data_file_name
        patched_is_relative = mocker.patch(
            "pathlib.Path.is_relative_to", return_value=False
        )
        patched_read_bytes = mocker.patch("pathlib.Path.read_bytes")
        content = {"path": "../file.png"}
        data_file.write_text(json.dumps(content))
        assert self.dfs._parse_data() is None
        assert self.dfs._data == content
        assert self.dfs._load_type == StorageLoadType.Full
        patched_is_relative.assert_called_once_with(self.node_abs_path)
        patched_read_bytes.assert_not_called()

    def test__parse_data_reference_file_not_exists(self, mocker):
        data_file = self.node_abs_path / self.dfs.__class__.data_file_name
        patched_is_relative = mocker.patch(
            "pathlib.Path.is_relative_to", return_value=True
        )
        mocker.patch("pathlib.Path.is_file", side_effect=[True, False])
        patched_read_bytes = mocker.patch("pathlib.Path.read_bytes")
        content = {"path": "./file.png"}
        data_file.write_text(json.dumps(content))
        assert self.dfs._parse_data() is None
        assert self.dfs._data == content
        assert self.dfs._load_type == StorageLoadType.Full
        patched_is_relative.assert_called_once_with(self.node_abs_path)
        patched_read_bytes.assert_not_called()

    def test__parse_data_reference_valid(self, mocker):
        data_file = self.node_abs_path / self.dfs.__class__.data_file_name
        patched_is_relative = mocker.patch(
            "pathlib.Path.is_relative_to", return_value=True
        )
        mocker.patch("pathlib.Path.is_file", return_value=True)
        patched_read_bytes = mocker.patch(
            "pathlib.Path.read_bytes", return_value=b"img"
        )
        data_file.write_text(json.dumps({"path": "./file.png"}))
        assert self.dfs._parse_data() is None
        assert self.dfs._data == {
            "path": {"./file.png": "data:image/png;base64,aW1n"}
        }
        assert self.dfs._load_type == StorageLoadType.Full
        patched_is_relative.assert_called_once_with(self.node_abs_path)
        patched_read_bytes.assert_called_once()
