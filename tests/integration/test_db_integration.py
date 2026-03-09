"""Integration tests for database functionality with real PostgreSQL.

These tests require PostgreSQL to be running and are automatically skipped if not available.
PostgreSQL credentials are configured in tests/conftest.py (POSTGRES_TEST_CONFIG).
"""

import pytest
from qualibrate_config.models import DBConfig, DatabaseStateConfig
from sqlalchemy import text

from qualibrate.core.infrastructure.DB.DBRegistry import DBRegistry
from qualibrate.core.infrastructure.DB.models.machine_state_model import MachineState
from qualibrate.core.infrastructure.DB.postgres_management import PostgresManagement
from qualibrate.core.infrastructure.DB.repositories.machine_state_repository import (
    MachineStateRepository,
)

@pytest.fixture
def test_db_config():
    """PostgreSQL configuration for testing.

    Uses shared configuration from root conftest.py to avoid credential duplication.
    This fixture imports the shared config at runtime to avoid import errors.
    """
    import sys
    from pathlib import Path

    # Import get_postgres_test_config from root conftest
    tests_dir = Path(__file__).parent.parent
    sys.path.insert(0, str(tests_dir))
    from conftest import get_postgres_test_config
    sys.path.pop(0)

    return DBConfig(get_postgres_test_config())


@pytest.fixture
def postgres_manager():
    """Create fresh PostgresManagement instance for each test."""
    # Reset singleton
    PostgresManagement._instance = None
    manager = PostgresManagement()
    yield manager
    # Cleanup
    manager.disconnect_all()
    PostgresManagement._instance = None


@pytest.fixture
def setup_test_table(postgres_manager, test_db_config):
    """Setup and teardown test table in database."""
    # Create table
    engine = postgres_manager._connect_to_db(test_db_config)

    with engine.connect() as conn:
        # Drop table if exists
        conn.execute(text("DROP TABLE IF EXISTS machine_state CASCADE"))
        conn.commit()

        # Create table
        conn.execute(
            text("""
            CREATE TABLE machine_state (
                id SERIAL PRIMARY KEY,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                content JSONB
            )
        """)
        )
        conn.commit()

    engine.dispose()
    yield

    # Cleanup: drop table after test
    engine = postgres_manager._connect_to_db(test_db_config)
    with engine.connect() as conn:
        conn.execute(text("DROP TABLE IF EXISTS machine_state CASCADE"))
        conn.commit()
    engine.dispose()


@pytest.mark.postgres
def test_postgres_connect_and_disconnect(postgres_manager, test_db_config):
    """Test connecting and disconnecting from PostgreSQL."""
    engine = postgres_manager._connect_to_db(test_db_config)

    # Verify connection works
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        assert result.scalar() == 1

    # Dispose engine
    engine.dispose()


@pytest.mark.postgres
def test_postgres_test_connection(postgres_manager, test_db_config):
    """Test the test_connection method with real database."""
    # Should not raise exception
    postgres_manager.test_connection(test_db_config)


@pytest.mark.postgres
def test_postgres_test_connection_invalid_credentials(postgres_manager):
    """Test test_connection with invalid credentials."""
    bad_config = DBConfig(
        {
            "host": "localhost",
            "port": 5432,
            "database": "postgres",
            "username": "wrong_user",
            "password": "wrong_password",
        }
    )

    with pytest.raises(RuntimeError, match="Could not connect to database"):
        postgres_manager.test_connection(bad_config)


@pytest.mark.postgres
def test_postgres_session_context_manager(postgres_manager, test_db_config, setup_test_table, mocker):
    """Test session context manager with real database."""
    # Mock config
    mocker.patch(
        "qualibrate.core.infrastructure.DB.postgres_management.get_qualibrate_config_path",
    )
    mock_config = mocker.MagicMock()
    mock_config.database = test_db_config
    mock_config.database_state = DatabaseStateConfig({"is_connected": True})
    mocker.patch(
        "qualibrate.core.infrastructure.DB.postgres_management.get_qualibrate_config",
        return_value=mock_config,
    )

    # Connect to database
    postgres_manager.db_connect("test_project")

    # Use session
    with postgres_manager.session("test_project") as session:
        result = session.execute(text("SELECT 1"))
        assert result.scalar() == 1

    # Disconnect
    postgres_manager.db_disconnect("test_project")


@pytest.mark.postgres
def test_postgres_session_rollback_on_error(postgres_manager, test_db_config, setup_test_table, mocker):
    """Test that session rolls back on error."""
    # Mock config
    mocker.patch(
        "qualibrate.core.infrastructure.DB.postgres_management.get_qualibrate_config_path",
    )
    mock_config = mocker.MagicMock()
    mock_config.database = test_db_config
    mock_config.database_state = DatabaseStateConfig({"is_connected": True})
    mocker.patch(
        "qualibrate.core.infrastructure.DB.postgres_management.get_qualibrate_config",
        return_value=mock_config,
    )

    postgres_manager.db_connect("test_project")

    # Trigger error in session
    with pytest.raises(ValueError):
        with postgres_manager.session("test_project") as session:
            # Do something that would be rolled back
            session.execute(text("SELECT 1"))
            raise ValueError("Test error")

    # Session should still be usable after rollback
    with postgres_manager.session("test_project") as session:
        result = session.execute(text("SELECT 1"))
        assert result.scalar() == 1

    postgres_manager.db_disconnect("test_project")


@pytest.mark.postgres
def test_machine_state_repository_save_and_load(postgres_manager, test_db_config, setup_test_table, mocker):
    """Test saving and loading machine state with real database."""
    # Mock config
    mocker.patch(
        "qualibrate.core.infrastructure.DB.postgres_management.get_qualibrate_config_path",
    )
    mock_config = mocker.MagicMock()
    mock_config.project = "test_project"
    mock_config.database = test_db_config
    mock_config.database_state = DatabaseStateConfig({"is_connected": True})
    mocker.patch(
        "qualibrate.core.infrastructure.DB.postgres_management.get_qualibrate_config",
        return_value=mock_config,
    )
    mocker.patch(
        "qualibrate.core.infrastructure.DB.postgres_base_repository.get_qualibrate_config",
        return_value=mock_config,
    )
    mocker.patch(
        "qualibrate.core.infrastructure.DB.postgres_base_repository.get_qualibrate_config_path",
    )

    # Connect to database
    postgres_manager.db_connect("test_project")

    # Create repository
    repository = MachineStateRepository(postgres_manager)

    # Save machine state
    machine_data = {
        "content": {
            "channels": [1, 2, 3],
            "wiring": {"port": 9510},
            "mixers": {"LO": 5.0e9},
        }
    }

    saved_state = repository.save(machine_data)

    assert saved_state is not None
    assert saved_state.id is not None
    assert saved_state.content == machine_data["content"]

    # Load machine state
    loaded_state = repository.load(saved_state.id)

    assert loaded_state is not None
    assert loaded_state.id == saved_state.id
    assert loaded_state.content == machine_data["content"]

    postgres_manager.db_disconnect("test_project")


@pytest.mark.postgres
def test_machine_state_repository_update(postgres_manager, test_db_config, setup_test_table, mocker):
    """Test updating machine state in real database."""
    # Mock config
    mocker.patch(
        "qualibrate.core.infrastructure.DB.postgres_management.get_qualibrate_config_path",
    )
    mock_config = mocker.MagicMock()
    mock_config.project = "test_project"
    mock_config.database = test_db_config
    mock_config.database_state = DatabaseStateConfig({"is_connected": True})
    mocker.patch(
        "qualibrate.core.infrastructure.DB.postgres_management.get_qualibrate_config",
        return_value=mock_config,
    )
    mocker.patch(
        "qualibrate.core.infrastructure.DB.postgres_base_repository.get_qualibrate_config",
        return_value=mock_config,
    )
    mocker.patch(
        "qualibrate.core.infrastructure.DB.postgres_base_repository.get_qualibrate_config_path",
    )

    postgres_manager.db_connect("test_project")
    repository = MachineStateRepository(postgres_manager)

    # Save initial state
    initial_data = {"content": {"state": "initial"}}
    saved_state = repository.save(initial_data)

    # Update state
    update_data = {"content": {"state": "updated", "new_field": "value"}}
    updated_state = repository.update(saved_state.id, update_data)

    assert updated_state is not None
    assert updated_state.id == saved_state.id
    assert updated_state.content == update_data["content"]

    # Verify update persisted
    loaded_state = repository.load(saved_state.id)
    assert loaded_state.content == update_data["content"]

    postgres_manager.db_disconnect("test_project")


@pytest.mark.postgres
def test_machine_state_repository_delete(postgres_manager, test_db_config, setup_test_table, mocker):
    """Test deleting machine state from real database."""
    # Mock config
    mocker.patch(
        "qualibrate.core.infrastructure.DB.postgres_management.get_qualibrate_config_path",
    )
    mock_config = mocker.MagicMock()
    mock_config.project = "test_project"
    mock_config.database = test_db_config
    mock_config.database_state = DatabaseStateConfig({"is_connected": True})
    mocker.patch(
        "qualibrate.core.infrastructure.DB.postgres_management.get_qualibrate_config",
        return_value=mock_config,
    )
    mocker.patch(
        "qualibrate.core.infrastructure.DB.postgres_base_repository.get_qualibrate_config",
        return_value=mock_config,
    )
    mocker.patch(
        "qualibrate.core.infrastructure.DB.postgres_base_repository.get_qualibrate_config_path",
    )

    postgres_manager.db_connect("test_project")
    repository = MachineStateRepository(postgres_manager)

    # Save state
    machine_data = {"content": {"state": "to_delete"}}
    saved_state = repository.save(machine_data)

    # Delete state
    repository.delete(saved_state.id)

    # Verify deletion
    loaded_state = repository.load(saved_state.id)
    assert loaded_state is None

    postgres_manager.db_disconnect("test_project")


@pytest.mark.postgres
def test_multiple_projects_connections(postgres_manager, test_db_config, setup_test_table, mocker):
    """Test managing connections for multiple projects."""
    # Mock config
    mocker.patch(
        "qualibrate.core.infrastructure.DB.postgres_management.get_qualibrate_config_path",
    )

    # Create configs for two projects
    mock_config1 = mocker.MagicMock()
    mock_config1.database = test_db_config
    mock_config1.database_state = DatabaseStateConfig({"is_connected": True})

    mock_config2 = mocker.MagicMock()
    mock_config2.database = test_db_config
    mock_config2.database_state = DatabaseStateConfig({"is_connected": True})

    # Connect first project
    mocker.patch(
        "qualibrate.core.infrastructure.DB.postgres_management.get_qualibrate_config",
        return_value=mock_config1,
    )
    postgres_manager.db_connect("project1")

    # Connect second project
    mocker.patch(
        "qualibrate.core.infrastructure.DB.postgres_management.get_qualibrate_config",
        return_value=mock_config2,
    )
    postgres_manager.db_connect("project2")

    # Verify both are connected
    assert postgres_manager.is_connected("project1")
    assert postgres_manager.is_connected("project2")

    # Disconnect first project
    postgres_manager.db_disconnect("project1")
    assert not postgres_manager.is_connected("project1")
    assert postgres_manager.is_connected("project2")

    # Disconnect second project
    postgres_manager.db_disconnect("project2")
    assert not postgres_manager.is_connected("project2")