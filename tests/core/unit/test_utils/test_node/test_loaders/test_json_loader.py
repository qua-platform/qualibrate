import json
from pathlib import Path
from tempfile import NamedTemporaryFile

import pytest

from qualibrate.core.utils.node.loaders.json_loader import JSONLoader


@pytest.fixture
def sample_json_file():
    data = {"key": "value", "number": 42}
    with NamedTemporaryFile(
        delete=False, mode="w", suffix=".json"
    ) as temp_file:
        json.dump(data, temp_file)
        temp_file_path = Path(temp_file.name)
    yield temp_file_path
    temp_file_path.unlink()  # Cleanup after test


@pytest.fixture
def invalid_json_file():
    with NamedTemporaryFile(
        delete=False, mode="w", suffix=".json"
    ) as temp_file:
        temp_file.write("{invalid: json}")  # Invalid JSON format
        temp_file_path = Path(temp_file.name)
    yield temp_file_path
    temp_file_path.unlink()  # Cleanup after test


def test_supported_extensions():
    assert JSONLoader.file_extensions == (".json",)


def test_load_valid_json(mocker, sample_json_file):
    mock_validate = mocker.patch.object(JSONLoader, "validate_file_exists")
    loader = JSONLoader()
    result = loader.load(sample_json_file)
    mock_validate.assert_called_once_with(sample_json_file)
    assert result == {"key": "value", "number": 42}


def test_load_invalid_json(invalid_json_file):
    loader = JSONLoader()
    with pytest.raises(json.JSONDecodeError):
        loader.load(invalid_json_file)


def test_load_nonexistent_file():
    loader = JSONLoader()
    with pytest.raises(FileNotFoundError):
        loader.load(Path("nonexistent.json"))
