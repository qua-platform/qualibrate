from pathlib import Path

import pytest


@pytest.fixture(scope="session")
def nodes_dumps_dir():
    return Path(__file__).parent / "nodes_dumps"
