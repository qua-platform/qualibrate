"""Tests for SnapshotHistoryBroadcaster class."""

from unittest.mock import AsyncMock, Mock

import pytest

from qualibrate.app.api.sockets.tasks import SnapshotHistoryBroadcaster


class TestSnapshotHistoryBroadcaster:
    """Tests for the SnapshotHistoryBroadcaster class."""

    @pytest.fixture
    def broadcaster(self):
        """Create a fresh broadcaster instance for each test."""
        return SnapshotHistoryBroadcaster()

    @pytest.fixture
    def mock_manager(self):
        """Create a mock WebSocket manager."""
        manager = Mock()
        manager.any_subscriber = True
        manager.broadcast = AsyncMock()
        return manager

    @pytest.fixture
    def mock_settings(self):
        """Create mock settings."""
        settings = Mock()
        settings.storage.location = "/test/storage"
        settings.project = "test_project"
        return settings

    def test_initial_state_is_none(self, broadcaster):
        """Test that the broadcaster starts with no previous snapshot ID."""
        assert broadcaster._previous_snapshot_id is None

    def test_reset_clears_state(self, broadcaster):
        """Test that reset() clears the tracked snapshot ID."""
        broadcaster._previous_snapshot_id = 123
        broadcaster.reset()
        assert broadcaster._previous_snapshot_id is None

    @pytest.mark.asyncio
    async def test_broadcast_skipped_when_no_subscribers(
        self, broadcaster, mock_manager, mocker
    ):
        """Test that broadcast is skipped when there are no subscribers."""
        mock_manager.any_subscriber = False
        mocker.patch(
            "qualibrate.app.api.sockets.tasks"
            ".get_need_to_update_snapshots_history_socket_manager",
            return_value=mock_manager,
        )

        await broadcaster.broadcast_if_changed()

        mock_manager.broadcast.assert_not_called()

    @pytest.mark.asyncio
    async def test_broadcast_called_when_subscribers_exist(
        self, broadcaster, mock_manager, mock_settings, mocker
    ):
        """Test that broadcast is called when subscribers exist."""
        mocker.patch(
            "qualibrate.app.api.sockets.tasks"
            ".get_need_to_update_snapshots_history_socket_manager",
            return_value=mock_manager,
        )
        mocker.patch(
            "qualibrate.app.api.sockets.tasks.get_settings",
            return_value=mock_settings,
        )
        mocker.patch(
            "qualibrate.app.api.sockets.tasks.get_config_path",
            return_value="/test/config",
        )
        mocker.patch(
            "qualibrate.app.api.sockets.tasks.find_nodes_ids_by_filter",
            return_value=iter([42]),
        )

        await broadcaster.broadcast_if_changed()

        mock_manager.broadcast.assert_called_once()

    @pytest.mark.asyncio
    async def test_state_tracked_between_calls(
        self, broadcaster, mock_manager, mock_settings, mocker
    ):
        """Test that previous snapshot ID is tracked between calls."""
        mocker.patch(
            "qualibrate.app.api.sockets.tasks"
            ".get_need_to_update_snapshots_history_socket_manager",
            return_value=mock_manager,
        )
        mocker.patch(
            "qualibrate.app.api.sockets.tasks.get_settings",
            return_value=mock_settings,
        )
        mocker.patch(
            "qualibrate.app.api.sockets.tasks.get_config_path",
            return_value="/test/config",
        )

        # First call - snapshot ID is 10
        mocker.patch(
            "qualibrate.app.api.sockets.tasks.find_nodes_ids_by_filter",
            return_value=iter([10]),
        )
        await broadcaster.broadcast_if_changed()
        assert broadcaster._previous_snapshot_id == 10

        # Second call - snapshot ID is 20
        mocker.patch(
            "qualibrate.app.api.sockets.tasks.find_nodes_ids_by_filter",
            return_value=iter([20]),
        )
        await broadcaster.broadcast_if_changed()
        assert broadcaster._previous_snapshot_id == 20

    @pytest.mark.asyncio
    async def test_broadcast_message_format(
        self, broadcaster, mock_manager, mock_settings, mocker
    ):
        """Test that the broadcast message has correct format."""
        mocker.patch(
            "qualibrate.app.api.sockets.tasks"
            ".get_need_to_update_snapshots_history_socket_manager",
            return_value=mock_manager,
        )
        mocker.patch(
            "qualibrate.app.api.sockets.tasks.get_settings",
            return_value=mock_settings,
        )
        mocker.patch(
            "qualibrate.app.api.sockets.tasks.get_config_path",
            return_value="/test/config",
        )
        mocker.patch(
            "qualibrate.app.api.sockets.tasks.find_nodes_ids_by_filter",
            return_value=iter([100]),
        )

        # First call - no previous ID
        await broadcaster.broadcast_if_changed()

        call_args = mock_manager.broadcast.call_args
        message = call_args[0][0]

        assert "latest_id" in message
        assert "saved_id" in message
        assert "update_required" in message
        assert message["latest_id"] == 100
        assert message["saved_id"] is None
        assert message["update_required"] is True

    @pytest.mark.asyncio
    async def test_broadcast_update_not_required_when_same_id(
        self, broadcaster, mock_manager, mock_settings, mocker
    ):
        """Test update_required is False when IDs match."""
        mocker.patch(
            "qualibrate.app.api.sockets.tasks"
            ".get_need_to_update_snapshots_history_socket_manager",
            return_value=mock_manager,
        )
        mocker.patch(
            "qualibrate.app.api.sockets.tasks.get_settings",
            return_value=mock_settings,
        )
        mocker.patch(
            "qualibrate.app.api.sockets.tasks.get_config_path",
            return_value="/test/config",
        )
        mocker.patch(
            "qualibrate.app.api.sockets.tasks.find_nodes_ids_by_filter",
            return_value=iter([50]),
        )

        # First call
        await broadcaster.broadcast_if_changed()

        # Reset mock and make second call with same ID
        mock_manager.broadcast.reset_mock()
        mocker.patch(
            "qualibrate.app.api.sockets.tasks.find_nodes_ids_by_filter",
            return_value=iter([50]),
        )
        await broadcaster.broadcast_if_changed()

        call_args = mock_manager.broadcast.call_args
        message = call_args[0][0]

        assert message["latest_id"] == 50
        assert message["saved_id"] == 50
        assert message["update_required"] is False

    @pytest.mark.asyncio
    async def test_handles_no_snapshots(
        self, broadcaster, mock_manager, mock_settings, mocker
    ):
        """Test handling when no snapshots exist."""
        mocker.patch(
            "qualibrate.app.api.sockets.tasks"
            ".get_need_to_update_snapshots_history_socket_manager",
            return_value=mock_manager,
        )
        mocker.patch(
            "qualibrate.app.api.sockets.tasks.get_settings",
            return_value=mock_settings,
        )
        mocker.patch(
            "qualibrate.app.api.sockets.tasks.get_config_path",
            return_value="/test/config",
        )
        # Return empty iterator - no snapshots
        mocker.patch(
            "qualibrate.app.api.sockets.tasks.find_nodes_ids_by_filter",
            return_value=iter([]),
        )

        await broadcaster.broadcast_if_changed()

        call_args = mock_manager.broadcast.call_args
        message = call_args[0][0]

        assert message["latest_id"] is None
        assert broadcaster._previous_snapshot_id is None
