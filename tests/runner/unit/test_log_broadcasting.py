"""Tests for WebSocket log broadcasting with datetime serialization."""

import asyncio
from datetime import datetime
from unittest.mock import AsyncMock, Mock

import pytest

from qualibrate.runner.core.app.ws_manager import (
    SocketConnectionManagerList,
    SocketConnectionManagerMapping,
)


class TestDatetimeSerialization:
    """Tests for datetime serialization in log broadcasting."""

    @pytest.fixture
    def manager(self):
        """Create a fresh manager instance."""
        return SocketConnectionManagerList()

    @pytest.fixture
    def mock_websocket(self):
        """Create a mock WebSocket that tracks sent messages."""
        ws = Mock()
        ws.accept = AsyncMock()
        ws.send_json = AsyncMock()
        return ws

    @pytest.mark.asyncio
    async def test_broadcast_with_datetime_fails_without_conversion(self, manager, mock_websocket):
        """Test that broadcasting a dict with datetime would fail JSON serialization.

        This test documents the original bug - datetime objects are not JSON serializable.
        """
        await manager.connect(mock_websocket)

        # Simulate a log entry with datetime (as stored by InMemoryLogHandler)
        log_entry_with_datetime = {
            "message": "Test log",
            "level": "INFO",
            "asctime": datetime(2024, 1, 15, 10, 30, 0),  # datetime object
        }

        # Make send_json raise TypeError like real JSON serialization would
        mock_websocket.send_json.side_effect = TypeError(
            "Object of type datetime is not JSON serializable"
        )

        # Broadcast should handle the error gracefully and disconnect the "failed" client
        await manager.broadcast(log_entry_with_datetime)

        # The websocket should have been disconnected due to error
        assert mock_websocket not in manager.active_connections

    @pytest.mark.asyncio
    async def test_broadcast_with_iso_string_succeeds(self, manager, mock_websocket):
        """Test that broadcasting with ISO string datetime works."""
        await manager.connect(mock_websocket)

        # Log entry with datetime converted to ISO string (the fix)
        log_entry_with_iso = {
            "message": "Test log",
            "level": "INFO",
            "asctime": datetime(2024, 1, 15, 10, 30, 0).isoformat(),
        }

        await manager.broadcast(log_entry_with_iso)

        # Should have sent successfully
        mock_websocket.send_json.assert_awaited_once_with(log_entry_with_iso)
        # Connection should still be active
        assert mock_websocket in manager.active_connections


class TestBroadcastLogFunction:
    """Tests for the broadcast_log callback function in lifespan."""

    @pytest.mark.asyncio
    async def test_broadcast_log_converts_datetime_to_iso(self):
        """Test that broadcast_log converts datetime to ISO string before broadcasting."""
        from qualibrate.runner.core.app.ws_managers import get_output_logs_socket_manager

        # Clear the cache to get a fresh manager
        get_output_logs_socket_manager.cache_clear()
        manager = get_output_logs_socket_manager()

        # Create a mock websocket and connect it
        mock_ws = Mock()
        mock_ws.accept = AsyncMock()
        mock_ws.send_json = AsyncMock()
        await manager.connect(mock_ws)

        # Import and set up the broadcast callback
        from qualibrate.runner.core.app.lifespan import _setup_log_broadcasting
        from qualibrate.core.utils.logger_m import logger

        _setup_log_broadcasting()

        # Create a log entry with datetime (as would come from InMemoryLogHandler)
        log_entry = {
            "message": "Test message",
            "level": "INFO",
            "asctime": datetime(2024, 1, 15, 10, 30, 45, 123456),
        }

        # Get the callback and call it
        callback = logger.in_memory_handler._broadcast_callback
        assert callback is not None

        # Call the callback
        callback(log_entry)

        # Give the async task time to run
        await asyncio.sleep(0.1)

        # Verify send_json was called with ISO string, not datetime
        mock_ws.send_json.assert_awaited_once()
        sent_data = mock_ws.send_json.call_args[0][0]

        # The asctime should be a string (ISO format), not a datetime
        assert isinstance(sent_data["asctime"], str)
        assert sent_data["asctime"] == "2024-01-15T10:30:45.123456"

        # Original log_entry should be unchanged (we copy it)
        assert isinstance(log_entry["asctime"], datetime)

        # Cleanup
        logger.in_memory_handler.set_broadcast_callback(None)
        get_output_logs_socket_manager.cache_clear()

    @pytest.mark.asyncio
    async def test_broadcast_log_handles_missing_asctime(self):
        """Test that broadcast_log handles log entries without asctime."""
        from qualibrate.runner.core.app.ws_managers import get_output_logs_socket_manager

        get_output_logs_socket_manager.cache_clear()
        manager = get_output_logs_socket_manager()

        mock_ws = Mock()
        mock_ws.accept = AsyncMock()
        mock_ws.send_json = AsyncMock()
        await manager.connect(mock_ws)

        from qualibrate.runner.core.app.lifespan import _setup_log_broadcasting
        from qualibrate.core.utils.logger_m import logger

        _setup_log_broadcasting()

        # Log entry without asctime
        log_entry = {
            "message": "Test message",
            "level": "INFO",
        }

        callback = logger.in_memory_handler._broadcast_callback
        callback(log_entry)

        await asyncio.sleep(0.1)

        # Should have sent successfully
        mock_ws.send_json.assert_awaited_once()
        sent_data = mock_ws.send_json.call_args[0][0]
        assert "asctime" not in sent_data

        # Cleanup
        logger.in_memory_handler.set_broadcast_callback(None)
        get_output_logs_socket_manager.cache_clear()

    @pytest.mark.asyncio
    async def test_broadcast_log_handles_string_asctime(self):
        """Test that broadcast_log handles asctime that's already a string."""
        from qualibrate.runner.core.app.ws_managers import get_output_logs_socket_manager

        get_output_logs_socket_manager.cache_clear()
        manager = get_output_logs_socket_manager()

        mock_ws = Mock()
        mock_ws.accept = AsyncMock()
        mock_ws.send_json = AsyncMock()
        await manager.connect(mock_ws)

        from qualibrate.runner.core.app.lifespan import _setup_log_broadcasting
        from qualibrate.core.utils.logger_m import logger

        _setup_log_broadcasting()

        # Log entry with asctime already as string
        log_entry = {
            "message": "Test message",
            "level": "INFO",
            "asctime": "2024-01-15T10:30:45",
        }

        callback = logger.in_memory_handler._broadcast_callback
        callback(log_entry)

        await asyncio.sleep(0.1)

        mock_ws.send_json.assert_awaited_once()
        sent_data = mock_ws.send_json.call_args[0][0]
        # Should remain a string
        assert sent_data["asctime"] == "2024-01-15T10:30:45"

        # Cleanup
        logger.in_memory_handler.set_broadcast_callback(None)
        get_output_logs_socket_manager.cache_clear()


class TestWebSocketManagerErrorHandling:
    """Tests for error handling in WebSocket manager broadcast."""

    @pytest.fixture
    def manager(self):
        return SocketConnectionManagerList()

    @pytest.mark.asyncio
    async def test_broadcast_removes_failed_connections(self, manager):
        """Test that connections that fail during broadcast are removed."""
        ws_good = Mock()
        ws_good.accept = AsyncMock()
        ws_good.send_json = AsyncMock()

        ws_bad = Mock()
        ws_bad.accept = AsyncMock()
        ws_bad.send_json = AsyncMock(side_effect=Exception("Connection closed"))

        await manager.connect(ws_good)
        await manager.connect(ws_bad)

        assert len(manager.active_connections) == 2

        await manager.broadcast({"test": "data"})

        # Bad connection should be removed
        assert ws_bad not in manager.active_connections
        # Good connection should remain
        assert ws_good in manager.active_connections
        assert len(manager.active_connections) == 1

    @pytest.mark.asyncio
    async def test_broadcast_continues_after_failed_connection(self, manager):
        """Test that broadcast continues to other connections after one fails."""
        ws1 = Mock()
        ws1.accept = AsyncMock()
        ws1.send_json = AsyncMock()

        ws_failing = Mock()
        ws_failing.accept = AsyncMock()
        ws_failing.send_json = AsyncMock(side_effect=Exception("Failed"))

        ws2 = Mock()
        ws2.accept = AsyncMock()
        ws2.send_json = AsyncMock()

        await manager.connect(ws1)
        await manager.connect(ws_failing)
        await manager.connect(ws2)

        message = {"test": "data"}
        await manager.broadcast(message)

        # Both good connections should have received the message
        ws1.send_json.assert_awaited_once_with(message)
        ws2.send_json.assert_awaited_once_with(message)


class TestSocketConnectionManagerMappingErrorHandling:
    """Tests for error handling in SocketConnectionManagerMapping broadcast."""

    @pytest.fixture
    def manager(self):
        return SocketConnectionManagerMapping[str]()

    @pytest.mark.asyncio
    async def test_broadcast_removes_failed_connections_by_key(self, manager):
        """Test that failed connections are removed from the correct key."""
        ws_good = Mock()
        ws_good.accept = AsyncMock()
        ws_good.send_json = AsyncMock()

        ws_bad = Mock()
        ws_bad.accept = AsyncMock()
        ws_bad.send_json = AsyncMock(side_effect=Exception("Connection closed"))

        await manager.connect("key1", ws_good)
        await manager.connect("key1", ws_bad)

        await manager.broadcast("key1", {"test": "data"})

        assert ws_bad not in manager.active_connections["key1"]
        assert ws_good in manager.active_connections["key1"]

    @pytest.mark.asyncio
    async def test_disconnect_handles_missing_key(self, manager):
        """Test that disconnect doesn't raise for non-existent key."""
        ws = Mock()
        # Should not raise
        manager.disconnect("nonexistent_key", ws)

    @pytest.mark.asyncio
    async def test_disconnect_handles_missing_websocket(self, manager):
        """Test that disconnect doesn't raise for non-existent websocket."""
        ws1 = Mock()
        ws1.accept = AsyncMock()
        ws2 = Mock()

        await manager.connect("key1", ws1)

        # Should not raise when trying to disconnect ws2 which was never connected
        manager.disconnect("key1", ws2)

        # ws1 should still be connected
        assert ws1 in manager.active_connections["key1"]
