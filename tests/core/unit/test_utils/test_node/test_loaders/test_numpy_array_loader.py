from pathlib import Path
from tempfile import NamedTemporaryFile

import numpy as np
import pytest

from qualibrate.core.utils.node.loaders.numpy_array_loader import NumpyArrayLoader


@pytest.fixture
def npy_file() -> Path:
    array = np.array([1, 2, 3])
    with NamedTemporaryFile(delete=False, suffix=".npy") as temp_file:
        np.save(temp_file.name, array)
        temp_file_path = Path(temp_file.name)
    yield temp_file_path
    temp_file_path.unlink()


@pytest.fixture
def npz_file() -> Path:
    with NamedTemporaryFile(delete=False, suffix=".npz") as temp_file:
        np.savez(
            temp_file.name,
            array1=np.array([1, 2, 3]),
            array2=np.array([4, 5, 6]),
        )
        temp_file_path = Path(temp_file.name)
    yield temp_file_path
    temp_file_path.unlink()


def test_load_npy_file(mocker, npy_file: Path):
    mock_validate = mocker.patch.object(
        NumpyArrayLoader, "validate_file_exists"
    )
    loader = NumpyArrayLoader()
    result = loader.load(npy_file)
    mock_validate.assert_called_once_with(npy_file)
    assert np.array_equal(result, np.array([1, 2, 3]))


def test_load_npz_file_with_subref(npz_file: Path):
    loader = NumpyArrayLoader()
    assert np.array_equal(
        loader.load(npz_file, subref="array1"), np.array([1, 2, 3])
    )
    assert np.array_equal(
        loader.load(npz_file, subref="array2"), np.array([4, 5, 6])
    )


def test_load_npz_file_with_invalid_subref(npz_file: Path):
    loader = NumpyArrayLoader()
    result = loader.load(npz_file, subref="invalid_key")
    assert result is None


def test_load_npz_file_without_subref(npz_file):
    loader = NumpyArrayLoader()
    result = loader.load(npz_file)
    assert isinstance(result, np.lib.npyio.NpzFile)
    assert list(result.keys()) == ["array1", "array2"]


def test_load_invalid_file():
    loader = NumpyArrayLoader()
    with pytest.raises(FileNotFoundError):
        loader.load(Path("nonexistent.npy"))


def test_load_npy_file_cache(npy_file: Path):
    loader = NumpyArrayLoader()
    result_first_load = loader.load(npy_file)
    result_second_load = loader.load(npy_file)
    assert np.array_equal(result_first_load, result_second_load)
    assert np.array_equal(loader.filepath_to_array[npy_file], result_first_load)


def test_load_npz_file_cache(npz_file: Path):
    loader = NumpyArrayLoader()
    result_first_load = loader.load(npz_file)
    result_second_load = loader.load(npz_file)
    assert result_first_load is result_second_load
    assert loader.filepath_to_array[npz_file] is result_first_load
