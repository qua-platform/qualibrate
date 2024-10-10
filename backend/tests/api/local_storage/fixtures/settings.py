from pathlib import Path
from typing import Generator

import pytest
import tomli_w
from fastapi.testclient import TestClient

from qualibrate_app.config import (
    CONFIG_KEY,
    QUALIBRATE_CONFIG_KEY,
    ActiveMachineSettings,
    JsonTimelineDBBase,
    QualibrateAppSettings,
    QualibrateRunnerBase,
    QualibrateSettings,
    StorageSettings,
    StorageType,
    get_config_path,
    get_settings,
)


@pytest.fixture
def settings(
    tmp_path: Path, default_local_storage_project: Path
) -> Generator[QualibrateAppSettings, None, None]:
    static = tmp_path / "static"
    static.mkdir()
    active_machine_path = tmp_path / "active_machine_path"
    active_machine_path.mkdir()
    yield QualibrateAppSettings(
        static_site_files=static,
        qualibrate=QualibrateSettings(
            project=default_local_storage_project.name,
            storage=StorageSettings(
                type=StorageType.local_storage,
                location=default_local_storage_project,
            ),
        ),
        metadata_out_path="data_path",
        timeline_db=JsonTimelineDBBase(
            address="http://localhost:8000/",
            timeout=0,
        ),
        runner=QualibrateRunnerBase(
            address="http://localhost:8001/execution/",
            timeout=1,
        ),
        active_machine=ActiveMachineSettings(path=active_machine_path),
    )


@pytest.fixture
def settings_path(tmp_path: Path) -> Generator[Path, None, None]:
    yield tmp_path / "config.toml"


@pytest.fixture
def settings_path_filled(settings: QualibrateAppSettings, settings_path: Path):
    with settings_path.open("wb") as fin:
        tomli_w.dump(
            {
                CONFIG_KEY: settings.model_dump(
                    exclude={"qualibrate"}, mode="json", exclude_none=True
                ),
                QUALIBRATE_CONFIG_KEY: settings.qualibrate.model_dump(
                    mode="json",
                    exclude_none=True,
                ),
            },
            fin,
        )
    yield settings_path


@pytest.fixture
def client_custom_settings(
    mocker,
    settings: QualibrateSettings,
    settings_path_filled: Path,
) -> Generator[TestClient, None, None]:
    get_config_path.cache_clear()
    mocker.patch(
        "qualibrate_app.config.resolvers.get_config_file",
        return_value=settings_path_filled,
    )
    # TODO: fix patch settings
    mocker.patch(
        "qualibrate_app.config.resolvers.get_settings", return_value=settings
    )

    from qualibrate_app.app import app

    client = TestClient(app)

    app.dependency_overrides[get_settings] = lambda: settings

    yield client
