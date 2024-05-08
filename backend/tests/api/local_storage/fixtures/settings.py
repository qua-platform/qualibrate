from pathlib import Path
from typing import Generator

import pytest
from fastapi.testclient import TestClient

from qualibrate.config import (
    JsonTimelineDBBase,
    QualibrateSettings,
    StorageType,
    get_settings,
)


@pytest.fixture
def settings(
    tmp_path: Path, default_local_storage_project: Path
) -> Generator[QualibrateSettings, None, None]:
    static = tmp_path / "static"
    static.mkdir()
    yield QualibrateSettings(
        static_site_files=static,
        user_storage=default_local_storage_project,
        project=default_local_storage_project.name,
        storage_type=StorageType.local_storage,
        metadata_out_path="data_path",
        timeline_db=JsonTimelineDBBase(
            spawn=False,
            address="http://localhost:8000",
            timeout=0,
        ),
    )


@pytest.fixture
def client_custom_settings(
    settings: QualibrateSettings,
) -> Generator[TestClient, None, None]:
    from qualibrate.app import app

    client = TestClient(app)

    app.dependency_overrides[get_settings] = lambda: settings

    yield client
