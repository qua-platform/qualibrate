from dataclasses import dataclass
from pathlib import Path

import pytest


@dataclass
class _Storage:
    location: Path


@dataclass
class _Settings:
    storage: _Storage
    project: str


@pytest.fixture
def settings(tmp_path):
    user_storage = tmp_path / "project"
    return _Settings(
        storage=_Storage(location=user_storage),
        project="project",
    )
