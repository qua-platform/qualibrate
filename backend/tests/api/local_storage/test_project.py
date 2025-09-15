import operator
import sys
from pathlib import Path

from fastapi.testclient import TestClient
from qualibrate_config.core.project.create import create_project
from qualibrate_config.core.project.path import get_project_path
from qualibrate_config.models import QualibrateConfig
from qualibrate_config.vars import QUALIBRATE_CONFIG_KEY

from qualibrate_app.config import get_config_path

if sys.version_info < (3, 11):
    import tomli as tomllib
else:
    import tomllib


def test_project_list(
    client_custom_settings: TestClient,
    local_storage_path: Path,
    settings_path_filled: Path,
):
    other_project_path = get_project_path(
        settings_path_filled.parent, "other_project"
    )
    create_project(
        settings_path_filled,
        "other_project",
        other_project_path / "storage",
        None,
        None,
    )
    response = client_custom_settings.get("/api/projects/")
    assert response.status_code == 200
    projects_l = list(sorted(response.json(), key=operator.itemgetter("name")))
    assert projects_l[0]["name"] == "other_project"
    assert projects_l[0]["nodes_number"] == 0
    assert "created_at" in projects_l[0]
    assert "last_modified_at" in projects_l[0]

    assert projects_l[1]["name"] == "project"
    assert projects_l[1]["nodes_number"] == 9
    assert "created_at" in projects_l[1]
    assert "last_modified_at" in projects_l[1]


def test_project_create(
    settings_path: Path,
    client_custom_settings: TestClient,
    local_storage_path: Path,
):
    assert list(local_storage_path.iterdir()) == [
        local_storage_path / "project"
    ]
    response = client_custom_settings.post(
        "/api/project/create", params={"project_name": "new_project"}
    )
    assert response.status_code == 201
    assert response.json() == "new_project"
    assert get_project_path(settings_path.parent, "new_project").is_dir()


def test_project_active_get(client_custom_settings: TestClient):
    response = client_custom_settings.get("/api/project/active")
    assert response.status_code == 200
    assert response.json() == "project"


def test_project_active_set_same(
    tmp_path: Path,
    client_custom_settings: TestClient,
    settings: QualibrateConfig,
):
    config_path = tmp_path / "config.toml"
    client_custom_settings.app.dependency_overrides[get_config_path] = (
        lambda: config_path
    )
    assert settings.project == "project"
    response = client_custom_settings.post(
        "/api/project/active", json="project"
    )
    assert response.status_code == 200
    assert response.json() == "project"
    assert settings.project == "project"


def test_project_active_set_other(
    tmp_path: Path,
    settings_path: Path,
    local_storage_path: Path,
    client_custom_settings: TestClient,
    settings: QualibrateConfig,
):
    create_project(settings_path, "new_project", None, None, None)
    new_project = "new_project"
    client_custom_settings.app.dependency_overrides[get_config_path] = (
        lambda: settings_path
    )
    (local_storage_path / new_project).mkdir()
    assert settings.project == "project"
    response = client_custom_settings.post(
        "/api/project/active", json="new_project"
    )
    assert response.status_code == 200
    with settings_path.open("rb") as f:
        updated_settings = tomllib.load(f)
    assert updated_settings[QUALIBRATE_CONFIG_KEY]["project"] == "new_project"
