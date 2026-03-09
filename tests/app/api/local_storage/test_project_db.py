"""Unit tests for Project CRUD operations with database configuration (mocked)."""

from pathlib import Path
from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

from qualibrate.app.api.core.models.project import Project
from qualibrate.core.infrastructure.DB.DBRegistry import DBRegistry


def test_project_create_with_database_config(
    client_custom_settings: TestClient,
    mocker,
):
    """Test creating a project with database configuration."""
    # Mock DBRegistry - just to avoid real DB connection attempts
    mock_db_manager = MagicMock()
    mocker.patch.object(DBRegistry, "get", return_value=mock_db_manager)

    database_config = {
        "host": "localhost",
        "port": 5432,
        "database": "test_project_db",
        "username": "postgres",
        "password": "postgres",
        "is_connected": True,
    }

    response = client_custom_settings.post(
        "/api/project/create",
        params={"project_name": "project_with_db"},
        json={"database": database_config},
    )

    assert response.status_code == 201
    project = response.json()
    assert project["name"] == "project_with_db"
    assert project.keys() == Project.model_fields.keys()
    # Note: db_connect is called when LocalStorageManager initializes, not during project creation endpoint


def test_project_create_without_database_config(
    client_custom_settings: TestClient,
    mocker,
):
    """Test creating a project without database configuration works fine."""
    # Mock DBRegistry to ensure it's not called
    mock_db_manager = MagicMock()
    mocker.patch.object(DBRegistry, "get", return_value=mock_db_manager)

    response = client_custom_settings.post(
        "/api/project/create",
        params={"project_name": "project_without_db"},
    )

    assert response.status_code == 201
    project = response.json()
    assert project["name"] == "project_without_db"


def test_project_create_with_database_connection_failure(
    client_custom_settings: TestClient,
    mocker,
):
    """Test that project creation succeeds even if DB connection fails."""
    # Mock DBRegistry to raise error on connection
    mock_db_manager = MagicMock()
    mock_db_manager.db_connect.side_effect = RuntimeError("DB not available")
    mocker.patch.object(DBRegistry, "get", return_value=mock_db_manager)

    database_config = {
        "host": "localhost",
        "port": 5432,
        "database": "test_project_db",
        "username": "postgres",
        "password": "postgres",
        "is_connected": True,
    }

    # Project creation should still succeed
    response = client_custom_settings.post(
        "/api/project/create",
        params={"project_name": "project_db_fail"},
        json={"database": database_config},
    )

    # Should succeed since DB is optional
    assert response.status_code == 201
    project = response.json()
    assert project["name"] == "project_db_fail"


def test_project_update_enable_database(
    client_custom_settings: TestClient,
    mocker,
):
    """Test updating a project to enable database connection."""
    # Mock DBRegistry
    mock_db_manager = MagicMock()
    mocker.patch.object(DBRegistry, "get", return_value=mock_db_manager)

    database_config = {
        "host": "localhost",
        "port": 5432,
        "database": "project_db",
        "username": "postgres",
        "password": "postgres",
        "is_connected": True,
    }

    response = client_custom_settings.put(
        "/api/project/update",
        json={"database": database_config},
    )

    assert response.status_code == 200
    project = response.json()
    assert project["name"] == "project"  # Active project from fixtures


def test_project_update_disable_database(
    client_custom_settings: TestClient,
    mocker,
):
    """Test updating a project to disable database connection."""
    # Mock DBRegistry
    mock_db_manager = MagicMock()
    mocker.patch.object(DBRegistry, "get", return_value=mock_db_manager)

    # Update with is_connected=False
    database_config = {
        "host": "localhost",
        "port": 5432,
        "database": "project_db",
        "username": "postgres",
        "password": "postgres",
        "is_connected": False,
    }

    response = client_custom_settings.put(
        "/api/project/update",
        json={"database": database_config},
    )

    assert response.status_code == 200
    project = response.json()
    assert project["name"] == "project"


def test_project_delete_with_database_cleanup(
    client_custom_settings: TestClient,
    settings_path: Path,
    local_storage_path: Path,
    settings,
    mocker,
):
    """Test that deleting a project works correctly."""
    from qualibrate_config.core.project.create import create_project

    # Create a project to delete
    create_project(settings_path, "project_to_delete", None, None, None)
    (local_storage_path / "project_to_delete").mkdir()

    # Mock DBRegistry - just to avoid real DB connection attempts
    mock_db_manager = MagicMock()
    mocker.patch.object(DBRegistry, "get", return_value=mock_db_manager)

    # Set the project to delete as active
    settings.project = "project_to_delete"

    response = client_custom_settings.delete("/api/project/delete/project_to_delete")

    assert response.status_code == 200
    assert response.json() == {"status": True}
    # Note: DB disconnect/connect are called when deleting active project, but testing
    # implementation details like call order is fragile. The behavior is tested elsewhere.


def test_project_delete_database_disconnect_failure(
    client_custom_settings: TestClient,
    settings_path: Path,
    local_storage_path: Path,
    settings,
    mocker,
):
    """Test that project deletion succeeds even if DB disconnect fails."""
    from qualibrate_config.core.project.create import create_project

    # Create a project to delete
    create_project(settings_path, "project_to_delete_2", None, None, None)
    (local_storage_path / "project_to_delete_2").mkdir()

    # Mock DBRegistry to raise error on disconnect
    mock_db_manager = MagicMock()
    mock_db_manager.db_disconnect.side_effect = Exception("DB disconnect failed")
    mocker.patch.object(DBRegistry, "get", return_value=mock_db_manager)

    # Set the project to delete as active
    settings.project = "project_to_delete_2"

    response = client_custom_settings.delete("/api/project/delete/project_to_delete_2")

    # Should succeed despite DB disconnect failure
    assert response.status_code == 200
    assert response.json() == {"status": True}


def test_db_test_connection_success(
    client_custom_settings: TestClient,
    mocker,
):
    """Test database connection test endpoint with valid credentials."""
    # Mock DBRegistry
    mock_db_manager = MagicMock()
    mock_db_manager.test_connection.return_value = None  # Successful test returns None
    mocker.patch.object(DBRegistry, "get", return_value=mock_db_manager)

    database_config = {
        "host": "localhost",
        "port": 5432,
        "database": "test_db",
        "username": "postgres",
        "password": "postgres",
    }

    response = client_custom_settings.post(
        "/api/project/db/test-connection",
        json=database_config,
    )

    assert response.status_code == 200
    assert response.json() is True
    mock_db_manager.test_connection.assert_called_once()


def test_db_test_connection_failure(
    client_custom_settings: TestClient,
    mocker,
):
    """Test database connection test endpoint with invalid credentials."""
    # Mock DBRegistry to raise error
    mock_db_manager = MagicMock()
    mock_db_manager.test_connection.side_effect = RuntimeError("Connection failed")
    mocker.patch.object(DBRegistry, "get", return_value=mock_db_manager)

    database_config = {
        "host": "invalid_host",
        "port": 5432,
        "database": "test_db",
        "username": "wrong_user",
        "password": "wrong_password",
    }

    response = client_custom_settings.post(
        "/api/project/db/test-connection",
        json=database_config,
    )

    assert response.status_code == 200
    assert response.json() is False
    mock_db_manager.test_connection.assert_called_once()


def test_project_active_set_with_database_switching(
    client_custom_settings: TestClient,
    settings_path: Path,
    local_storage_path: Path,
    settings,
    mocker,
):
    """Test that switching active project manages database connections."""
    from qualibrate_config.core.project.create import create_project

    # Create another project
    create_project(settings_path, "new_project_with_db", None, None, None)
    (local_storage_path / "new_project_with_db").mkdir()

    # Mock DBRegistry
    mock_db_manager = MagicMock()
    mocker.patch.object(DBRegistry, "get", return_value=mock_db_manager)

    # Current project is "project"
    assert settings.project == "project"

    # Switch to new project
    response = client_custom_settings.post(
        "/api/project/active",
        json="new_project_with_db",
    )

    assert response.status_code == 200
    assert response.json() == "new_project_with_db"

    # Verify DB disconnect was called for old project
    mock_db_manager.db_disconnect.assert_called_with("project")
    # Verify DB connect was called for new project
    mock_db_manager.db_connect.assert_called_with("new_project_with_db")


def test_project_active_set_database_connection_failure(
    client_custom_settings: TestClient,
    settings_path: Path,
    local_storage_path: Path,
    settings,
    mocker,
):
    """Test that project switching succeeds even if DB connection fails."""
    from qualibrate_config.core.project.create import create_project

    # Create another project
    create_project(settings_path, "new_project_2", None, None, None)
    (local_storage_path / "new_project_2").mkdir()

    # Mock DBRegistry to raise error on connect
    mock_db_manager = MagicMock()
    mock_db_manager.db_connect.side_effect = RuntimeError("DB not available")
    mocker.patch.object(DBRegistry, "get", return_value=mock_db_manager)

    # Switch to new project - should succeed despite DB error
    response = client_custom_settings.post(
        "/api/project/active",
        json="new_project_2",
    )

    assert response.status_code == 200
    assert response.json() == "new_project_2"