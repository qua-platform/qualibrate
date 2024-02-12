from pathlib import Path

import pytest

from qualibrate.api.core.utils import path_utils


def test_resolve_and_check_relative_valid():
    base_path = Path("/usr/local/.cache")
    assert path_utils.resolve_and_check_relative(
        base_path, Path("sub/path")
    ) == Path("/usr/local/.cache/sub/path")


def test_resolve_and_check_relative_invalid_not_subpath():
    with pytest.raises(ValueError) as ex:
        path_utils.resolve_and_check_relative(Path(), Path("../sub/path"))
    assert ex.type == ValueError
    assert ex.value.args[0] == "Subpath isn't relative to base."
