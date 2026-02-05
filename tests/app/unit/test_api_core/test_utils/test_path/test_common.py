from pathlib import Path

import pytest

from qualibrate.app.api.core.utils.path import common
from qualibrate.app.api.exceptions.classes.storage import (
    QRelativeNotSubpathException,
)


def test_resolve_and_check_relative_valid():
    base_path = Path("/usr/local/.cache")
    assert common.resolve_and_check_relative(base_path, Path("sub/path")) == Path("/usr/local/.cache/sub/path")


def test_resolve_and_check_relative_invalid_not_subpath():
    with pytest.raises(QRelativeNotSubpathException) as ex:
        common.resolve_and_check_relative(Path(), Path("../sub/path"))
    assert ex.type == QRelativeNotSubpathException
    assert ex.value.args[0] == "Subpath isn't relative to base."
