from pathlib import Path
from typing import Generator

import pytest
from fastapi.testclient import TestClient

from qualibrate.config import (
    JsonTimelineDBBase,
    QualibrateSettings,
    StorageType,
    get_config_path,
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
    mocker,
    settings: QualibrateSettings,
) -> Generator[TestClient, None, None]:
    get_config_path.cache_clear()
    mocker.patch("qualibrate.config.get_config_file")
    mocker.patch(
        "qualibrate.config.read_config_file",
        return_value={"qualibrate": {**settings.model_dump(mode="json")}},
    )
    mocker.patch("qualibrate.app.get_settings", return_value=settings)

    from qualibrate.app import app

    client = TestClient(app)

    app.dependency_overrides[get_settings] = lambda: settings

    yield client
