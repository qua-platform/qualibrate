from pathlib import Path
from tempfile import NamedTemporaryFile
from typing import Any

import pytest

from qualibrate.utils.node.loaders.base_loader import BaseLoader


class DummyLoader(BaseLoader):
    file_extensions = (".txt", ".csv")

    def load(self, file_path: Path, **kwargs: Any) -> Any:
        raise NotImplementedError


def test_is_loader_support_extension():
    assert DummyLoader.is_loader_support_extension(".txt")
    assert DummyLoader.is_loader_support_extension(".csv")
    assert not DummyLoader.is_loader_support_extension(".json")
    assert not DummyLoader.is_loader_support_extension("")


def test_is_loader_support_extension_case_insensitive():
    assert DummyLoader.is_loader_support_extension(".TXT")
    assert DummyLoader.is_loader_support_extension(".Csv")


def test_validate_file_exists_file_exists():
    with NamedTemporaryFile(suffix=".txt") as temp_file:
        file = Path(temp_file.name)
        file.touch()
        assert DummyLoader.validate_file_exists(Path(temp_file.name)) is None


def test_validate_file_exists_file_non_exists():
    with pytest.raises(FileNotFoundError):
        DummyLoader.validate_file_exists(Path("nonexistent.json"))


def test_base_loader_abstract_methods():
    with pytest.raises(TypeError):
        BaseLoader()
