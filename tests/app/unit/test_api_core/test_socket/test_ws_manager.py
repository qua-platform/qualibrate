"""Tests for WebSocket connection manager classes."""

from unittest.mock import AsyncMock, Mock

import pytest

from qualibrate.app.api.core.socket.ws_manager import (
    SocketConnectionManagerList,
    SocketConnectionManagerMapping,
)


class TestSocketConnectionManagerList:
    """Tests for SocketConnectionManagerList class."""

    @pytest.fixture
    def manager(self):
        """Create a fresh manager instance for each test."""
        return SocketConnectionManagerList()

    @pytest.fixture
    def mock_websocket(self):
        """Create a mock WebSocket."""
        ws = Mock()
        ws.accept = AsyncMock()
        ws.send_json = AsyncMock()
        return ws

    def test_initial_state_is_empty(self, manager):
        """Test that manager starts with no connections."""
        assert manager.active_connections == []
        assert manager.any_subscriber is False

    @pytest.mark.asyncio
    async def test_connect_accepts_websocket(self, manager, mock_websocket):
        """Test that connect() calls accept() on the websocket."""
        await manager.connect(mock_websocket)

        mock_websocket.accept.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_connect_adds_to_active_connections(self, manager, mock_websocket):
        """Test that connect() adds websocket to active connections."""
        await manager.connect(mock_websocket)

        assert mock_websocket in manager.active_connections
        assert len(manager.active_connections) == 1

    @pytest.mark.asyncio
    async def test_connect_multiple_websockets(self, manager):
        """Test connecting multiple websockets."""
        ws1 = Mock()
        ws1.accept = AsyncMock()
        ws2 = Mock()
        ws2.accept = AsyncMock()

        await manager.connect(ws1)
        await manager.connect(ws2)

        assert len(manager.active_connections) == 2
        assert ws1 in manager.active_connections
        assert ws2 in manager.active_connections

    def test_disconnect_removes_websocket(self, manager, mock_websocket):
        """Test that disconnect() removes websocket from active connections."""
        manager.active_connections.append(mock_websocket)

        manager.disconnect(mock_websocket)

        assert mock_websocket not in manager.active_connections
        assert len(manager.active_connections) == 0

    def test_disconnect_nonexistent_websocket_no_error(self, manager, mock_websocket):
        """Test that disconnecting non-existent websocket doesn't raise."""
        # Should not raise
        manager.disconnect(mock_websocket)

        assert len(manager.active_connections) == 0

    def test_disconnect_keeps_other_connections(self, manager):
        """Test that disconnect only removes the specified websocket."""
        ws1 = Mock()
        ws2 = Mock()
        manager.active_connections.extend([ws1, ws2])

        manager.disconnect(ws1)

        assert ws1 not in manager.active_connections
        assert ws2 in manager.active_connections
        assert len(manager.active_connections) == 1

    @pytest.mark.asyncio
    async def test_broadcast_sends_to_all_connections(self, manager):
        """Test that broadcast() sends message to all connections."""
        ws1 = Mock()
        ws1.send_json = AsyncMock()
        ws2 = Mock()
        ws2.send_json = AsyncMock()
        manager.active_connections.extend([ws1, ws2])
        message = {"test": "data"}

        await manager.broadcast(message)

        ws1.send_json.assert_awaited_once_with(message)
        ws2.send_json.assert_awaited_once_with(message)

    @pytest.mark.asyncio
    async def test_broadcast_handles_disconnected_clients(self, manager):
        """Test that broadcast removes clients that fail to receive."""
        ws_good = Mock()
        ws_good.send_json = AsyncMock()
        ws_bad = Mock()
        ws_bad.send_json = AsyncMock(side_effect=Exception("Connection closed"))
        manager.active_connections.extend([ws_good, ws_bad])

        await manager.broadcast({"test": "data"})

        # Bad websocket should be removed
        assert ws_bad not in manager.active_connections
        # Good websocket should remain
        assert ws_good in manager.active_connections
        assert len(manager.active_connections) == 1

    @pytest.mark.asyncio
    async def test_broadcast_empty_connections(self, manager):
        """Test that broadcast with no connections doesn't raise."""
        # Should not raise
        await manager.broadcast({"test": "data"})

    def test_any_subscriber_false_when_empty(self, manager):
        """Test any_subscriber returns False when no connections."""
        assert manager.any_subscriber is False

    def test_any_subscriber_true_when_connected(self, manager, mock_websocket):
        """Test any_subscriber returns True when connections exist."""
        manager.active_connections.append(mock_websocket)

        assert manager.any_subscriber is True


class TestSocketConnectionManagerMapping:
    """Tests for SocketConnectionManagerMapping class."""

    @pytest.fixture
    def manager(self):
        """Create a fresh manager instance for each test."""
        return SocketConnectionManagerMapping()

    @pytest.fixture
    def mock_websocket(self):
        """Create a mock WebSocket."""
        ws = Mock()
        ws.accept = AsyncMock()
        ws.send_json = AsyncMock()
        return ws

    def test_initial_state_is_empty(self, manager):
        """Test that manager starts with no connections."""
        assert manager.any_subscriber is False

    @pytest.mark.asyncio
    async def test_connect_accepts_websocket(self, manager, mock_websocket):
        """Test that connect() calls accept() on the websocket."""
        await manager.connect("key1", mock_websocket)

        mock_websocket.accept.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_connect_adds_to_active_connections_by_key(self, manager, mock_websocket):
        """Test that connect() adds websocket to the correct key."""
        await manager.connect("key1", mock_websocket)

        assert mock_websocket in manager.active_connections["key1"]
        assert len(manager.active_connections["key1"]) == 1

    @pytest.mark.asyncio
    async def test_connect_multiple_keys(self, manager):
        """Test connecting websockets to different keys."""
        ws1 = Mock()
        ws1.accept = AsyncMock()
        ws2 = Mock()
        ws2.accept = AsyncMock()

        await manager.connect("key1", ws1)
        await manager.connect("key2", ws2)

        assert ws1 in manager.active_connections["key1"]
        assert ws2 in manager.active_connections["key2"]
        assert ws1 not in manager.active_connections["key2"]
        assert ws2 not in manager.active_connections["key1"]

    @pytest.mark.asyncio
    async def test_connect_multiple_to_same_key(self, manager):
        """Test connecting multiple websockets to the same key."""
        ws1 = Mock()
        ws1.accept = AsyncMock()
        ws2 = Mock()
        ws2.accept = AsyncMock()

        await manager.connect("key1", ws1)
        await manager.connect("key1", ws2)

        assert ws1 in manager.active_connections["key1"]
        assert ws2 in manager.active_connections["key1"]
        assert len(manager.active_connections["key1"]) == 2

    def test_disconnect_removes_websocket_from_key(self, manager, mock_websocket):
        """Test that disconnect() removes websocket from the correct key."""
        manager.active_connections["key1"].append(mock_websocket)

        manager.disconnect("key1", mock_websocket)

        assert mock_websocket not in manager.active_connections["key1"]

    def test_disconnect_nonexistent_key_no_error(self, manager, mock_websocket):
        """Test that disconnecting from non-existent key doesn't raise."""
        # Should not raise
        manager.disconnect("nonexistent", mock_websocket)

    def test_disconnect_keeps_other_keys_connections(self, manager):
        """Test that disconnect only affects the specified key."""
        ws1 = Mock()
        ws2 = Mock()
        manager.active_connections["key1"].append(ws1)
        manager.active_connections["key2"].append(ws2)

        manager.disconnect("key1", ws1)

        assert ws1 not in manager.active_connections["key1"]
        assert ws2 in manager.active_connections["key2"]

    @pytest.mark.asyncio
    async def test_broadcast_sends_to_key_connections_only(self, manager):
        """Test that broadcast() only sends to connections for that key."""
        ws1 = Mock()
        ws1.send_json = AsyncMock()
        ws2 = Mock()
        ws2.send_json = AsyncMock()
        manager.active_connections["key1"].append(ws1)
        manager.active_connections["key2"].append(ws2)
        message = {"test": "data"}

        await manager.broadcast("key1", message)

        ws1.send_json.assert_awaited_once_with(message)
        ws2.send_json.assert_not_called()

    @pytest.mark.asyncio
    async def test_broadcast_handles_disconnected_clients(self, manager):
        """Test that broadcast removes clients that fail to receive."""
        ws_good = Mock()
        ws_good.send_json = AsyncMock()
        ws_bad = Mock()
        ws_bad.send_json = AsyncMock(side_effect=Exception("Connection closed"))
        manager.active_connections["key1"].extend([ws_good, ws_bad])

        await manager.broadcast("key1", {"test": "data"})

        assert ws_bad not in manager.active_connections["key1"]
        assert ws_good in manager.active_connections["key1"]

    @pytest.mark.asyncio
    async def test_broadcast_no_subscribers_for_key(self, manager):
        """Test that broadcast with no subscribers for key doesn't send."""
        ws = Mock()
        ws.send_json = AsyncMock()
        manager.active_connections["key1"].append(ws)

        # Broadcast to a different key
        await manager.broadcast("key2", {"test": "data"})

        ws.send_json.assert_not_called()

    def test_any_subscriber_false_when_empty(self, manager):
        """Test any_subscriber returns False when no connections."""
        assert manager.any_subscriber is False

    def test_any_subscriber_true_when_connected(self, manager, mock_websocket):
        """Test any_subscriber returns True when connections exist."""
        manager.active_connections["key1"].append(mock_websocket)

        assert manager.any_subscriber is True

    def test_any_subscriber_false_when_all_keys_empty(self, manager):
        """Test any_subscriber returns False when all keys have empty lists."""
        # Create keys with empty lists
        manager.active_connections["key1"] = []
        manager.active_connections["key2"] = []

        assert manager.any_subscriber is False

    def test_any_subscriber_for_specific_key(self, manager, mock_websocket):
        """Test any_subscriber_for returns correct value for specific key."""
        manager.active_connections["key1"].append(mock_websocket)

        assert manager.any_subscriber_for("key1") is True
        assert manager.any_subscriber_for("key2") is False

    def test_any_subscriber_for_empty_key(self, manager):
        """Test any_subscriber_for returns False for empty key."""
        manager.active_connections["key1"] = []

        assert manager.any_subscriber_for("key1") is False
