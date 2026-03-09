"""Unit tests for MachineStateRepository (mocked)."""

from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from qualibrate.core.infrastructure.DB.models.machine_state_model import MachineState
from qualibrate.core.infrastructure.DB.postgres_management import PostgresManagement
from qualibrate.core.infrastructure.DB.repositories.machine_state_repository import (
    MachineStateRepository,
)


@pytest.fixture
def mock_db_management():
    """Mock PostgresManagement."""
    return MagicMock(spec=PostgresManagement)


@pytest.fixture
def mock_session():
    """Mock database session."""
    session = MagicMock()
    session.__enter__ = MagicMock(return_value=session)
    session.__exit__ = MagicMock(return_value=None)
    return session


@pytest.fixture
def mock_config(mocker):
    """Mock qualibrate config and patches."""
    mock_cfg = MagicMock()
    mock_cfg.project = "test_project"

    mocker.patch(
        "qualibrate.core.infrastructure.DB.postgres_base_repository.get_qualibrate_config_path",
        return_value=Path("/fake/config.toml"),
    )
    mocker.patch(
        "qualibrate.core.infrastructure.DB.postgres_base_repository.get_qualibrate_config",
        return_value=mock_cfg,
    )

    return mock_cfg


@pytest.fixture
def repository(mock_db_management):
    """Create MachineStateRepository instance."""
    return MachineStateRepository(mock_db_management)


class TestRepositoryInitialization:
    """Tests for repository initialization."""

    @patch("qualibrate.core.infrastructure.DB.postgres_base_repository.get_qualibrate_config")
    @patch("qualibrate.core.infrastructure.DB.postgres_base_repository.get_qualibrate_config_path")
    def test_repository_initialization(
        self,
        mock_get_config_path,
        mock_get_config,
        mock_db_management,
    ):
        """Test repository initialization."""
        repo = MachineStateRepository(mock_db_management)

        assert repo.model is MachineState
        assert repo._db is mock_db_management

    def test_repository_without_model_raises_error(self, mock_db_management):
        """Test that repository without model raises error."""
        from qualibrate.core.infrastructure.DB.postgres_base_repository import (
            PostgresBaseRepository,
        )

        # Create repository without setting model
        with pytest.raises(NotImplementedError, match="Subclasses must define a model"):
            PostgresBaseRepository(mock_db_management)


@patch("qualibrate.core.infrastructure.DB.postgres_base_repository.get_qualibrate_config")
@patch("qualibrate.core.infrastructure.DB.postgres_base_repository.get_qualibrate_config_path")
def test_repository_project_property(
    mock_get_config_path,
    mock_get_config,
    repository,
):
    """Test that project property retrieves active project."""
    mock_config = MagicMock()
    mock_config.project = "test_project"
    mock_get_config.return_value = mock_config
    mock_get_config_path.return_value = Path("/fake/config.toml")

    project = repository.project

    assert project == "test_project"
    assert repository._project == "test_project"


class TestRepositorySave:
    """Tests for save() method."""

    def test_repository_save_success(
        self,
        repository,
        mock_db_management,
        mock_session,
        mock_config,
    ):
        """Test saving machine state to database."""
        mock_db_management.session.return_value = mock_session

        # Test data
        machine_data = {
            "content": {
                "channels": [1, 2, 3],
                "wiring": {"port": 9510},
            }
        }

        result = repository.save(machine_data)

        # Verify session was opened
        mock_db_management.session.assert_called_once_with("test_project")

        # Verify object was added and expunged
        mock_session.add.assert_called_once()
        mock_session.expunge.assert_called_once()

        # Verify result is MachineState instance
        assert isinstance(result, MachineState)

    def test_repository_save_with_missing_project(
        self,
        repository,
        mock_db_management,
        mock_config,
        mocker,
    ):
        """Test save handles missing project gracefully."""
        # Mock session to raise RuntimeError (project not in DB)
        mock_db_management.session.side_effect = RuntimeError("No database connection configured for project")

        mock_logger = mocker.patch("qualibrate.core.utils.db_utils.project_handling.logger")

        machine_data = {"content": {"state": "test"}}

        result = repository.save(machine_data)

        # Verify returns None (default) and logs warning
        assert result is None
        mock_logger.warning.assert_called_once()


class TestRepositoryLoad:
    """Tests for load() method."""

    def test_repository_load_success(
        self,
        repository,
        mock_db_management,
        mock_session,
        mock_config,
    ):
        """Test loading machine state from database."""
        mock_db_management.session.return_value = mock_session

        # Mock loaded object
        mock_machine_state = MagicMock(spec=MachineState)
        mock_machine_state.id = 1
        mock_machine_state.content = {"state": "loaded"}
        mock_session.get.return_value = mock_machine_state

        result = repository.load(1)

        # Verify session.get was called with correct arguments
        mock_session.get.assert_called_once_with(MachineState, 1)

        # Verify expunge was called
        mock_session.expunge.assert_called_once_with(mock_machine_state)

        assert result is mock_machine_state

    def test_repository_load_not_found(
        self,
        repository,
        mock_db_management,
        mock_session,
        mock_config,
    ):
        """Test loading nonexistent machine state returns None."""
        mock_db_management.session.return_value = mock_session
        mock_session.get.return_value = None  # Object not found

        result = repository.load(999)

        assert result is None
        mock_session.expunge.assert_not_called()


class TestRepositoryUpdate:
    """Tests for update() method."""

    def test_repository_update_success(
        self,
        repository,
        mock_db_management,
        mock_session,
        mock_config,
    ):
        """Test updating machine state in database."""
        mock_db_management.session.return_value = mock_session

        # Mock existing object
        mock_machine_state = MagicMock(spec=MachineState)
        mock_machine_state.id = 1
        mock_machine_state.content = {"state": "old"}
        mock_session.get.return_value = mock_machine_state

        # Update data
        update_data = {"content": {"state": "updated"}}

        result = repository.update(1, update_data)

        # Verify session.get was called
        mock_session.get.assert_called_once_with(MachineState, 1)

        # Verify attributes were updated
        assert mock_machine_state.content == {"state": "updated"}

        # Verify expunge was called
        mock_session.expunge.assert_called_once_with(mock_machine_state)

        assert result is mock_machine_state

    def test_repository_update_not_found(
        self,
        repository,
        mock_db_management,
        mock_session,
        mock_config,
    ):
        """Test updating nonexistent machine state returns None."""
        mock_db_management.session.return_value = mock_session
        mock_session.get.return_value = None  # Object not found

        result = repository.update(999, {"content": {"state": "updated"}})

        assert result is None
        mock_session.expunge.assert_not_called()


class TestRepositoryDelete:
    """Tests for delete() method."""

    def test_repository_delete_success(
        self,
        repository,
        mock_db_management,
        mock_session,
        mock_config,
    ):
        """Test deleting machine state from database."""
        mock_db_management.session.return_value = mock_session

        # Mock existing object
        mock_machine_state = MagicMock(spec=MachineState)
        mock_machine_state.id = 1
        mock_session.get.return_value = mock_machine_state

        repository.delete(1)

        # Verify session.get was called
        mock_session.get.assert_called_once_with(MachineState, 1)

        # Verify delete was called
        mock_session.delete.assert_called_once_with(mock_machine_state)

    def test_repository_delete_not_found(
        self,
        repository,
        mock_db_management,
        mock_session,
        mock_config,
    ):
        """Test deleting nonexistent machine state does nothing."""
        mock_db_management.session.return_value = mock_session
        mock_session.get.return_value = None  # Object not found

        repository.delete(999)

        # Verify delete was not called
        mock_session.delete.assert_not_called()


@patch("qualibrate.core.infrastructure.DB.postgres_base_repository.get_qualibrate_config")
@patch("qualibrate.core.infrastructure.DB.postgres_base_repository.get_qualibrate_config_path")
def test_repository_operations_with_missing_project(
    mock_get_config_path,
    mock_get_config,
    repository,
    mock_db_management,
    mocker,
):
    """Test that all repository operations handle missing project gracefully."""
    # Setup mocks
    mock_config = MagicMock()
    mock_config.project = "test_project"
    mock_get_config.return_value = mock_config
    mock_get_config_path.return_value = Path("/fake/config.toml")

    # Mock session to raise RuntimeError
    mock_db_management.session.side_effect = RuntimeError("No database connection")

    mock_logger = mocker.patch("qualibrate.core.utils.db_utils.project_handling.logger")

    # Test save
    result = repository.save({"content": {}})
    assert result is None

    # Test load
    result = repository.load(1)
    assert result is None

    # Test update
    result = repository.update(1, {"content": {}})
    assert result is None

    # Test delete
    result = repository.delete(1)
    assert result is None

    # Verify warnings were logged for each operation
    assert mock_logger.warning.call_count == 4
