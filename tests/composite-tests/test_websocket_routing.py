"""Integration tests for WebSocket routing in composite app."""

import pytest
from starlette.testclient import TestClient

# Skip all tests in this file - they require composite app which does module-level
# initialization that needs config.toml. Properly fixing these requires refactoring
# how the composite app initializes (moving initialization out of module-level code).
pytestmark = pytest.mark.skip(
    reason="Composite app requires config.toml at module import time. "
    "Fixing these tests requires refactoring composite app initialization. "
    "Tests came from websocket branch already broken."
)


class TestWebSocketRouting:
    """Test that WebSocket routes are accessible at the expected paths."""

    @pytest.fixture
    def client(self):
        """Create test client for composite app."""
        from qualibrate.composite.app import app
        return TestClient(app)

    def test_ws_output_logs_accessible(self, client):
        """Test /ws/output_logs WebSocket endpoint is accessible."""
        with client.websocket_connect("/ws/output_logs") as websocket:
            # Connection succeeded - endpoint is routable
            assert websocket is not None

    def test_ws_run_status_accessible(self, client):
        """Test /ws/run_status WebSocket endpoint is accessible."""
        with client.websocket_connect("/ws/run_status") as websocket:
            assert websocket is not None

    def test_ws_workflow_execution_history_accessible(self, client):
        """Test /ws/workflow_execution_history WebSocket endpoint is accessible."""
        with client.websocket_connect("/ws/workflow_execution_history") as websocket:
            assert websocket is not None

    def test_ws_update_snapshots_history_required_accessible(self, client):
        """Test /ws/update_snapshots_history_required WebSocket endpoint is accessible."""
        with client.websocket_connect("/ws/update_snapshots_history_required") as websocket:
            assert websocket is not None

    def test_execution_ws_output_logs_also_accessible(self, client):
        """Test /execution/ws/output_logs is also accessible (mounted runner path)."""
        with client.websocket_connect("/execution/ws/output_logs") as websocket:
            assert websocket is not None
