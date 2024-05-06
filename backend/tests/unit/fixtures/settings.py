from dataclasses import dataclass
from pathlib import Path

import pytest


@dataclass
class _Settings:
    user_storage: Path
    project: str
    metadata_out_path: str


@pytest.fixture
def settings(tmp_path):
    user_storage = tmp_path / "project"
    return _Settings(
        user_storage=user_storage,
        project="project",
        metadata_out_path="data_path",
    )
