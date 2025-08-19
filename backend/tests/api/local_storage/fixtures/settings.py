from collections.abc import Generator
from pathlib import Path

import pytest
import tomli_w
from fastapi.testclient import TestClient
from qualibrate_config.core.project.path import get_project_path
from qualibrate_config.models import QualibrateConfig
from qualibrate_config.models.qualibrate import QualibrateTopLevelConfig
from qualibrate_config.models.storage_type import StorageType

from qualibrate_app.config import get_config_path, get_settings


@pytest.fixture
def settings(
    tmp_path: Path, default_local_storage_project: Path
) -> Generator[QualibrateConfig, None, None]:
    static = tmp_path / "static"
    static.mkdir()
    top = QualibrateTopLevelConfig(
        {
            "qualibrate": dict(
                project=default_local_storage_project.name,
                app={
                    "static_site_files": static,
                    "timeline_db": dict(
                        address="http://localhost:8000/",
                        timeout=0,
                    ),
                },
                storage=dict(
                    type=StorageType.local_storage,
                    location=default_local_storage_project,
                ),
                runner=dict(
                    address="http://localhost:8001/execution/",
                    timeout=1,
                ),
            )
        }
    )
    yield top.qualibrate


@pytest.fixture
def settings_path(tmp_path: Path) -> Generator[Path, None, None]:
    yield tmp_path / "config.toml"


@pytest.fixture
def settings_path_filled(settings: QualibrateConfig, settings_path: Path):
    with settings_path.open("wb") as fin:
        tomli_w.dump(
            settings._root.serialize(),
            fin,
        )
    yield settings_path


@pytest.fixture
def client_custom_settings(
    mocker,
    settings: QualibrateConfig,
    settings_path_filled: Path,
) -> Generator[TestClient, None, None]:
    get_config_path.cache_clear()
    project_path = get_project_path(
        settings_path_filled.parent, settings.project
    )
    project_path.mkdir(parents=True)
    mocker.patch(
        "qualibrate_config.resolvers.get_config_file",
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
