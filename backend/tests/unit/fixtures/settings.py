from dataclasses import dataclass
from pathlib import Path

import pytest


@dataclass
class _Storage:
    location: Path


@dataclass
class _Qualibrate:
    storage: _Storage
    project: str


@dataclass
class _Settings:
    qualibrate: _Qualibrate
    metadata_out_path: str


@pytest.fixture
def settings(tmp_path):
    user_storage = tmp_path / "project"
    return _Settings(
        qualibrate=_Qualibrate(
            storage=_Storage(location=user_storage),
            project="project",
        ),
        metadata_out_path="data_path",
    )
