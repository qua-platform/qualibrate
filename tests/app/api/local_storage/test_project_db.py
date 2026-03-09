"""Unit tests for Project CRUD operations with database configuration (mocked)."""

from pathlib import Path
from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient
from qualibrate_config.core.project.create import create_project

from qualibrate.app.api.core.models.project import Project
from qualibrate.core.infrastructure.DB.DBRegistry import DBRegistry


@pytest.fixture
def database_config():
    """Standard database configuration for testing."""
    return {
        "host": "localhost",
        "port": 5432,
        "database": "test_project_db",
        "username": "postgres",
        "password": "postgres",
        "is_connected": True,
    }


@pytest.fixture
def database_config_disconnected(database_config):
    """Database configuration with is_connected=False."""
    config = database_config.copy()
    config["is_connected"] = False
    return config


@pytest.fixture
def invalid_database_config():
    """Invalid database configuration for testing connection failures."""
    return {
        "host": "invalid_host",
        "port": 5432,
        "database": "test_db",
        "username": "wrong_user",
        "password": "wrong_password",
    }


@pytest.fixture
def mock_db_manager(mocker):
    """Mock DB manager and patch DBRegistry."""
    mock_manager = MagicMock()
    mocker.patch.object(DBRegistry, "get", return_value=mock_manager)
    return mock_manager


class TestProjectCreation:
    """Tests for project creation with database configuration."""

    def test_project_create_with_database_config(
        self,
        client_custom_settings: TestClient,
        mock_db_manager,
        database_config,
    ):
        """Test creating a project with database configuration."""
        response = client_custom_settings.post(
            "/api/project/create",
            params={"project_name": "project_with_db"},
            json={"database": database_config},
        )

        assert response.status_code == 201
        project = response.json()
        assert project["name"] == "project_with_db"
        assert project.keys() == Project.model_fields.keys()

    def test_project_create_without_database_config(
        self,
        client_custom_settings: TestClient,
        mock_db_manager,
    ):
        """Test creating a project without database configuration works fine."""
        response = client_custom_settings.post(
            "/api/project/create",
            params={"project_name": "project_without_db"},
        )

        assert response.status_code == 201
        project = response.json()
        assert project["name"] == "project_without_db"

    def test_project_create_with_database_connection_failure(
        self,
        client_custom_settings: TestClient,
        mock_db_manager,
        database_config,
    ):
        """Test that project creation succeeds even if DB connection fails."""
        # Configure mock to raise error on connection
        mock_db_manager.db_connect.side_effect = RuntimeError("DB not available")

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


class TestProjectUpdate:
    """Tests for project update with database configuration."""

    def test_project_update_enable_database(
        self,
        client_custom_settings: TestClient,
        mock_db_manager,
        database_config,
    ):
        """Test updating a project to enable database connection."""
        response = client_custom_settings.put(
            "/api/project/update",
            json={"database": database_config},
        )

        assert response.status_code == 200
        project = response.json()
        assert project["name"] == "project"  # Active project from fixtures

    def test_project_update_disable_database(
        self,
        client_custom_settings: TestClient,
        mock_db_manager,
        database_config_disconnected,
    ):
        """Test updating a project to disable database connection."""
        response = client_custom_settings.put(
            "/api/project/update",
            json={"database": database_config_disconnected},
        )

        assert response.status_code == 200
        project = response.json()
        assert project["name"] == "project"


class TestProjectDeletion:
    """Tests for project deletion with database cleanup."""

    def test_project_delete_with_database_cleanup(
        self,
        client_custom_settings: TestClient,
        settings_path: Path,
        local_storage_path: Path,
        settings,
        mock_db_manager,
    ):
        """Test that deleting a project works correctly."""
        # Create a project to delete (with storage location so directory is created)
        create_project(
            settings_path,
            "project_to_delete",
            local_storage_path / "project_to_delete",
            None,
            None,
        )

        # Set the project to delete as active
        settings.project = "project_to_delete"

        response = client_custom_settings.delete("/api/project/delete/project_to_delete")

        assert response.status_code == 200
        assert response.json() == {"status": True}

    def test_project_delete_database_disconnect_failure(
        self,
        client_custom_settings: TestClient,
        settings_path: Path,
        local_storage_path: Path,
        settings,
        mock_db_manager,
    ):
        """Test that project deletion succeeds even if DB disconnect fails."""
        # Create a project to delete (with storage location so directory is created)
        create_project(
            settings_path,
            "project_to_delete_2",
            local_storage_path / "project_to_delete_2",
            None,
            None,
        )

        # Configure mock to raise error on disconnect
        mock_db_manager.db_disconnect.side_effect = Exception("DB disconnect failed")

        # Set the project to delete as active
        settings.project = "project_to_delete_2"

        response = client_custom_settings.delete("/api/project/delete/project_to_delete_2")

        # Should succeed despite DB disconnect failure
        assert response.status_code == 200
        assert response.json() == {"status": True}


class TestDatabaseConnection:
    """Tests for database connection testing endpoint."""

    def test_db_test_connection_success(
        self,
        client_custom_settings: TestClient,
        mock_db_manager,
        database_config,
    ):
        """Test database connection test endpoint with valid credentials."""
        # Remove is_connected from config for test-connection endpoint
        test_config = {k: v for k, v in database_config.items() if k != "is_connected"}

        # Configure mock to return None (successful test)
        mock_db_manager.test_connection.return_value = None

        response = client_custom_settings.post(
            "/api/project/db/test-connection",
            json=test_config,
        )

        assert response.status_code == 200
        assert response.json() is True
        mock_db_manager.test_connection.assert_called_once()

    def test_db_test_connection_failure(
        self,
        client_custom_settings: TestClient,
        mock_db_manager,
        invalid_database_config,
    ):
        """Test database connection test endpoint with invalid credentials."""
        # Configure mock to raise error
        mock_db_manager.test_connection.side_effect = RuntimeError("Connection failed")

        response = client_custom_settings.post(
            "/api/project/db/test-connection",
            json=invalid_database_config,
        )

        assert response.status_code == 200
        assert response.json() is False
        mock_db_manager.test_connection.assert_called_once()


class TestProjectSwitching:
    """Tests for switching active project with database management."""

    def test_project_active_set_with_database_switching(
        self,
        client_custom_settings: TestClient,
        settings_path: Path,
        local_storage_path: Path,
        settings,
        mock_db_manager,
    ):
        """Test that switching active project manages database connections."""
        # Create another project (with storage location so directory is created)
        create_project(
            settings_path,
            "new_project_with_db",
            local_storage_path / "new_project_with_db",
            None,
            None,
        )

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
        self,
        client_custom_settings: TestClient,
        settings_path: Path,
        local_storage_path: Path,
        settings,
        mock_db_manager,
    ):
        """Test that project switching succeeds even if DB connection fails."""
        # Create another project (with storage location so directory is created)
        create_project(
            settings_path,
            "new_project_2",
            local_storage_path / "new_project_2",
            None,
            None,
        )

        # Configure mock to raise error on connect
        mock_db_manager.db_connect.side_effect = RuntimeError("DB not available")

        # Switch to new project - should succeed despite DB error
        response = client_custom_settings.post(
            "/api/project/active",
            json="new_project_2",
        )

        assert response.status_code == 200
        assert response.json() == "new_project_2"
