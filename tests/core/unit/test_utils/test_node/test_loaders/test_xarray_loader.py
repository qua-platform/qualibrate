from importlib.util import find_spec
from pathlib import Path
from tempfile import NamedTemporaryFile

import pytest

from qualibrate.core.utils.node.loaders.xarray_loader import XarrayLoader

XARRAY_AVAILABLE = find_spec("xarray") is not None


@pytest.fixture
def h5_file():
    if not XARRAY_AVAILABLE:
        pytest.skip("xarray library is not installed.")
    with NamedTemporaryFile(delete=False, suffix=".h5") as temp_file:
        file_path = Path(temp_file.name)
        import xarray as xr

        data = xr.Dataset({"temperature": (("x", "y"), [[15, 20], [25, 30]])})
        data.to_netcdf(file_path)
    yield file_path
    file_path.unlink()  # Cleanup after test


def test_supported_extensions():
    assert XarrayLoader.file_extensions == (".h5",)


def test_validate_file_exists_called(mocker, h5_file):
    loader = XarrayLoader()

    mock_validate = mocker.patch.object(
        XarrayLoader, "validate_file_exists", autospec=True
    )
    loader.load(h5_file)
    mock_validate.assert_called_once_with(h5_file)


@pytest.mark.skipif(
    not XARRAY_AVAILABLE, reason="xarray library is not installed."
)
def test_load_valid_h5(h5_file):
    from xarray import Dataset

    loader = XarrayLoader()
    result = loader.load(h5_file)
    assert isinstance(result, Dataset)
    assert "temperature" in result


def test_load_nonexistent_file():
    """Test attempting to load a nonexistent HDF5 file."""
    loader = XarrayLoader()
    with pytest.raises(FileNotFoundError):
        loader.load(Path("nonexistent.h5"))


def test_load_with_xarray_unavailable(monkeypatch):
    monkeypatch.setattr(
        "qualibrate.core.utils.node.loaders.xarray_loader.find_spec", lambda _: None
    )
    loader = XarrayLoader()
    result = loader.load(Path("dummy.h5"))
    assert result is None
