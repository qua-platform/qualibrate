"""Unit tests for PostgresManagement (mocked)."""

from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest
from qualibrate_config.models import DBConfig, DatabaseStateConfig
from sqlalchemy.exc import OperationalError, SQLAlchemyError

from qualibrate.core.infrastructure.DB.postgres_management import PostgresManagement


@pytest.fixture
def db_config():
    """Sample database configuration."""
    return DBConfig(
        {
            "host": "localhost",
            "port": 5432,
            "database": "test_db",
            "username": "test_user",
            "password": "test_password",
        }
    )


@pytest.fixture
def db_state_connected():
    """Database state configuration (connected)."""
    return DatabaseStateConfig({"is_connected": True})


@pytest.fixture
def db_state_disconnected():
    """Database state configuration (disconnected)."""
    return DatabaseStateConfig({"is_connected": False})


@pytest.fixture
def postgres_manager_reset():
    """Reset PostgresManagement singleton for testing."""
    # Clear singleton instance
    PostgresManagement._instance = None
    yield
    # Clean up after test
    if PostgresManagement._instance:
        PostgresManagement._instance._engines.clear()
        PostgresManagement._instance._session_factories.clear()
    PostgresManagement._instance = None


class TestPostgresManagementSingleton:
    """Tests for singleton pattern."""

    def test_postgres_management_singleton(self, postgres_manager_reset):
        """Test that PostgresManagement is a singleton."""
        manager1 = PostgresManagement()
        manager2 = PostgresManagement()

        assert manager1 is manager2
        assert PostgresManagement._instance is manager1


class TestDatabaseConnection:
    """Tests for _connect_to_db() method."""

    @patch("qualibrate.core.infrastructure.DB.postgres_management.create_engine")
    def test_connect_to_db_success(self, mock_create_engine, postgres_manager_reset, db_config):
        """Test successful database connection."""
        # Mock engine and connection
        mock_engine = MagicMock()
        mock_conn = MagicMock()
        mock_engine.connect.return_value.__enter__.return_value = mock_conn
        mock_create_engine.return_value = mock_engine

        manager = PostgresManagement()
        engine = manager._connect_to_db(db_config)

        assert engine is mock_engine
        mock_create_engine.assert_called_once()
        mock_conn.execute.assert_called_once()

    @patch("qualibrate.core.infrastructure.DB.postgres_management.create_engine")
    def test_connect_to_db_operational_error(self, mock_create_engine, postgres_manager_reset, db_config):
        """Test connection failure with OperationalError."""
        # Mock engine to raise OperationalError
        mock_engine = MagicMock()
        mock_engine.connect.side_effect = OperationalError("Connection refused", None, None)
        mock_create_engine.return_value = mock_engine

        manager = PostgresManagement()

        with pytest.raises(RuntimeError, match="Could not connect to database"):
            manager._connect_to_db(db_config)

    @patch("qualibrate.core.infrastructure.DB.postgres_management.create_engine")
    def test_connect_to_db_sqlalchemy_error(self, mock_create_engine, postgres_manager_reset, db_config):
        """Test connection failure with SQLAlchemyError."""
        # Mock engine to raise SQLAlchemyError
        mock_engine = MagicMock()
        mock_engine.connect.side_effect = SQLAlchemyError("Database error")
        mock_create_engine.return_value = mock_engine

        manager = PostgresManagement()

        with pytest.raises(RuntimeError, match="Database error during connect"):
            manager._connect_to_db(db_config)


class TestProjectConnection:
    """Tests for db_connect() method."""

    @patch("qualibrate.core.infrastructure.DB.postgres_management.get_qualibrate_config")
    @patch("qualibrate.core.infrastructure.DB.postgres_management.get_qualibrate_config_path")
    @patch("qualibrate.core.infrastructure.DB.postgres_management.create_engine")
    def test_db_connect_success(
        self,
        mock_create_engine,
        mock_get_config_path,
        mock_get_config,
        postgres_manager_reset,
        db_config,
        db_state_connected,
    ):
        """Test db_connect() with valid configuration."""
        # Mock config
        mock_config = MagicMock()
        mock_config.database = db_config
        mock_config.database_state = db_state_connected
        mock_get_config.return_value = mock_config
        mock_get_config_path.return_value = Path("/fake/config.toml")

        # Mock engine
        mock_engine = MagicMock()
        mock_conn = MagicMock()
        mock_engine.connect.return_value.__enter__.return_value = mock_conn
        mock_create_engine.return_value = mock_engine

        manager = PostgresManagement()
        manager.db_connect("test_project")

        # Verify engine was created and stored
        assert "test_project" in manager._engines
        assert "test_project" in manager._session_factories

    @patch("qualibrate.core.infrastructure.DB.postgres_management.get_qualibrate_config")
    @patch("qualibrate.core.infrastructure.DB.postgres_management.get_qualibrate_config_path")
    def test_db_connect_already_connected(
        self,
        mock_get_config_path,
        mock_get_config,
        postgres_manager_reset,
    ):
        """Test db_connect() when project is already connected."""
        manager = PostgresManagement()

        # Manually add project to engines to simulate existing connection
        mock_engine = MagicMock()
        manager._engines["test_project"] = mock_engine

        # Try to connect again - should return early
        manager.db_connect("test_project")

        # Verify no new config was fetched (returned early)
        mock_get_config.assert_not_called()

    @patch("qualibrate.core.infrastructure.DB.postgres_management.get_qualibrate_config")
    @patch("qualibrate.core.infrastructure.DB.postgres_management.get_qualibrate_config_path")
    def test_db_connect_database_not_connected_state(
        self,
        mock_get_config_path,
        mock_get_config,
        postgres_manager_reset,
        db_config,
        db_state_disconnected,
    ):
        """Test db_connect() skips when is_connected is False."""
        # Mock config with is_connected=False
        mock_config = MagicMock()
        mock_config.database = db_config
        mock_config.database_state = db_state_disconnected
        mock_get_config.return_value = mock_config
        mock_get_config_path.return_value = Path("/fake/config.toml")

        manager = PostgresManagement()
        manager.db_connect("test_project")

        # Verify no connection was made
        assert "test_project" not in manager._engines
        assert "test_project" not in manager._session_factories

    @patch("qualibrate.core.infrastructure.DB.postgres_management.get_qualibrate_config")
    @patch("qualibrate.core.infrastructure.DB.postgres_management.get_qualibrate_config_path")
    def test_db_connect_no_database_config(
        self,
        mock_get_config_path,
        mock_get_config,
        postgres_manager_reset,
        db_state_connected,
    ):
        """Test db_connect() skips when database config is None."""
        # Mock config with no database configuration
        mock_config = MagicMock()
        mock_config.database = None
        mock_config.database_state = db_state_connected
        mock_get_config.return_value = mock_config
        mock_get_config_path.return_value = Path("/fake/config.toml")

        manager = PostgresManagement()
        manager.db_connect("test_project")

        # Verify no connection was made
        assert "test_project" not in manager._engines
        assert "test_project" not in manager._session_factories


class TestProjectDisconnection:
    """Tests for db_disconnect() and disconnect_all() methods."""

    def test_db_disconnect_success(self, postgres_manager_reset):
        """Test disconnecting from a project database."""
        manager = PostgresManagement()

        # Mock an existing connection
        mock_engine = MagicMock()
        manager._engines["test_project"] = mock_engine
        manager._session_factories["test_project"] = MagicMock()

        manager.db_disconnect("test_project")

        # Verify engine was disposed
        mock_engine.dispose.assert_called_once()

        # Verify project was removed from tracking
        assert "test_project" not in manager._engines
        assert "test_project" not in manager._session_factories

    def test_db_disconnect_no_connection(self, postgres_manager_reset, mocker):
        """Test disconnecting when no connection exists."""
        manager = PostgresManagement()

        # Mock logger to verify warning
        mock_logger = mocker.patch("qualibrate.core.infrastructure.DB.postgres_management.logger")

        manager.db_disconnect("nonexistent_project")

        # Verify warning was logged
        mock_logger.warning.assert_called_once()
        assert "No database connection found" in str(mock_logger.warning.call_args)

    def test_db_disconnect_disposal_error(self, postgres_manager_reset):
        """Test db_disconnect() handles engine disposal errors."""
        manager = PostgresManagement()

        # Mock an existing connection that raises error on dispose
        mock_engine = MagicMock()
        mock_engine.dispose.side_effect = Exception("Disposal failed")
        manager._engines["test_project"] = mock_engine
        manager._session_factories["test_project"] = MagicMock()

        with pytest.raises(Exception, match="Error disposing engine"):
            manager.db_disconnect("test_project")

    def test_disconnect_all(self, postgres_manager_reset):
        """Test disconnecting all project databases."""
        manager = PostgresManagement()

        # Mock multiple connections
        mock_engine1 = MagicMock()
        mock_engine2 = MagicMock()
        manager._engines["project1"] = mock_engine1
        manager._engines["project2"] = mock_engine2
        manager._session_factories["project1"] = MagicMock()
        manager._session_factories["project2"] = MagicMock()

        manager.disconnect_all()

        # Verify all engines were disposed
        mock_engine1.dispose.assert_called_once()
        mock_engine2.dispose.assert_called_once()

        # Verify all connections were cleared
        assert len(manager._engines) == 0
        assert len(manager._session_factories) == 0

    def test_disconnect_all_with_errors(self, postgres_manager_reset, mocker):
        """Test disconnect_all() handles disposal errors gracefully."""
        manager = PostgresManagement()

        # Mock logger
        mock_logger = mocker.patch("qualibrate.core.infrastructure.DB.postgres_management.logger")

        # Mock connection that raises error on dispose
        mock_engine = MagicMock()
        mock_engine.dispose.side_effect = Exception("Disposal failed")
        manager._engines["project1"] = mock_engine
        manager._session_factories["project1"] = MagicMock()

        manager.disconnect_all()

        # Verify warning was logged
        mock_logger.warning.assert_called_once()
        assert "Error disposing engine" in str(mock_logger.warning.call_args)

        # Verify connections were cleared despite error
        assert len(manager._engines) == 0
        assert len(manager._session_factories) == 0


class TestConnectionStatus:
    """Tests for is_connected() method."""

    def test_is_connected(self, postgres_manager_reset):
        """Test is_connected() returns correct status."""
        manager = PostgresManagement()

        # No connection initially
        assert manager.is_connected("test_project") is False

        # Add connection
        manager._session_factories["test_project"] = MagicMock()
        assert manager.is_connected("test_project") is True

        # Remove connection
        manager._session_factories.pop("test_project")
        assert manager.is_connected("test_project") is False


class TestSessionManagement:
    """Tests for session() context manager."""

    def test_session_context_manager_success(self, postgres_manager_reset):
        """Test session() context manager with successful transaction."""
        manager = PostgresManagement()

        # Mock session factory
        mock_session = MagicMock()
        mock_session_factory = MagicMock(return_value=mock_session)
        manager._session_factories["test_project"] = mock_session_factory

        with manager.session("test_project") as session:
            assert session is mock_session

        # Verify commit and close were called
        mock_session.commit.assert_called_once()
        mock_session.close.assert_called_once()
        mock_session.rollback.assert_not_called()

    def test_session_context_manager_error(self, postgres_manager_reset):
        """Test session() context manager with exception (rollback)."""
        manager = PostgresManagement()

        # Mock session factory
        mock_session = MagicMock()
        mock_session_factory = MagicMock(return_value=mock_session)
        manager._session_factories["test_project"] = mock_session_factory

        with pytest.raises(ValueError):
            with manager.session("test_project"):
                raise ValueError("Test error")

        # Verify rollback was called, not commit
        mock_session.rollback.assert_called_once()
        mock_session.commit.assert_not_called()
        mock_session.close.assert_called_once()

    def test_session_no_connection(self, postgres_manager_reset):
        """Test session() raises error when project not connected."""
        manager = PostgresManagement()

        with pytest.raises(RuntimeError, match="No database connection configured"):
            with manager.session("nonexistent_project"):
                pass


class TestConnectionTesting:
    """Tests for test_connection() method."""

    @patch("qualibrate.core.infrastructure.DB.postgres_management.create_engine")
    def test_test_connection_success(self, mock_create_engine, postgres_manager_reset, db_config):
        """Test test_connection() with valid credentials."""
        # Mock engine
        mock_engine = MagicMock()
        mock_conn = MagicMock()
        mock_engine.connect.return_value.__enter__.return_value = mock_conn
        mock_create_engine.return_value = mock_engine

        manager = PostgresManagement()
        manager.test_connection(db_config)

        # Verify engine was created and disposed
        mock_create_engine.assert_called_once()
        mock_engine.dispose.assert_called_once()

    @patch("qualibrate.core.infrastructure.DB.postgres_management.create_engine")
    def test_test_connection_failure(self, mock_create_engine, postgres_manager_reset, db_config):
        """Test test_connection() with invalid credentials."""
        # Mock engine to raise error
        mock_engine = MagicMock()
        mock_engine.connect.side_effect = OperationalError("Connection refused", None, None)
        mock_create_engine.return_value = mock_engine

        manager = PostgresManagement()

        with pytest.raises(RuntimeError, match="Could not connect to database"):
            manager.test_connection(db_config)