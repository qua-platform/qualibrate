from importlib.util import find_spec
from pathlib import Path
from tempfile import NamedTemporaryFile

import pytest

from qualibrate.core.utils.node.loaders.image_loader import ImageLoader

PIL_AVAILABLE = find_spec("PIL") is not None


@pytest.fixture
def png_file():
    if not PIL_AVAILABLE:
        pytest.skip("PIL library is not installed.")
    from PIL import Image

    with NamedTemporaryFile(delete=False, suffix=".png") as temp_file:
        img = Image.new("RGB", (10, 10), color="red")
        img.save(temp_file.name, "PNG")
        temp_file_path = Path(temp_file.name)
    yield temp_file_path
    temp_file_path.unlink()  # Cleanup after test


def test_supported_extensions():
    assert ImageLoader.file_extensions == (".png",)


@pytest.mark.skipif(not PIL_AVAILABLE, reason="PIL library is not installed.")
def test_load_valid_png(mocker, png_file):
    mock_validate = mocker.patch.object(ImageLoader, "validate_file_exists")
    loader = ImageLoader()
    image = loader.load(png_file)
    mock_validate.assert_called_once_with(png_file)
    assert image is not None
    assert image.size == (10, 10)


def test_load_nonexistent_file():
    """Test attempting to load a nonexistent image file."""
    loader = ImageLoader()
    with pytest.raises(FileNotFoundError):
        loader.load(Path("nonexistent.png"))


def test_load_with_pil_unavailable(monkeypatch):
    monkeypatch.setattr(
        "qualibrate.core.utils.node.loaders.image_loader.find_spec", lambda _: None
    )
    loader = ImageLoader()
    result = loader.load(Path("dummy.png"))
    assert result is None
