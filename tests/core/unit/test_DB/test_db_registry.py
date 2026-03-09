"""Unit tests for DBRegistry."""

from unittest.mock import MagicMock

import pytest

from qualibrate.core.infrastructure.DB.DB_management import DBManagement
from qualibrate.core.infrastructure.DB.DBRegistry import DBRegistry


@pytest.fixture(autouse=True)
def reset_db_registry():
    """Reset DBRegistry before and after each test to ensure clean state."""
    DBRegistry._db_manager = None
    yield
    DBRegistry._db_manager = None


class TestDBRegistry:
    """Tests for DBRegistry singleton pattern."""

    def test_db_registry_configure(self):
        """Test that DBRegistry.configure() sets the DB manager."""
        mock_manager = MagicMock(spec=DBManagement)
        DBRegistry.configure(mock_manager)

        assert DBRegistry._db_manager is mock_manager

    def test_db_registry_get_success(self):
        """Test that DBRegistry.get() returns configured manager."""
        mock_manager = MagicMock(spec=DBManagement)
        DBRegistry.configure(mock_manager)

        retrieved = DBRegistry.get()
        assert retrieved is mock_manager

    def test_db_registry_get_not_configured(self):
        """Test that DBRegistry.get() raises error when not configured."""
        # DBRegistry is reset by fixture, so _db_manager is None
        with pytest.raises(RuntimeError, match="DB not configured"):
            DBRegistry.get()

    def test_db_registry_reconfigure(self):
        """Test that DBRegistry can be reconfigured with a different manager."""

        mock_manager1 = MagicMock(spec=DBManagement)
        mock_manager2 = MagicMock(spec=DBManagement)

        DBRegistry.configure(mock_manager1)
        assert DBRegistry.get() is mock_manager1

        # Reconfigure with different manager
        DBRegistry.configure(mock_manager2)
        assert DBRegistry.get() is mock_manager2
        assert DBRegistry.get() is not mock_manager1
