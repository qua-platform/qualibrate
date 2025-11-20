"""
Integration tests for run_job.py using real node definition files.

These tests verify the full execution chain:
run_job → node.run() → ActionManager → Action

They use real parametric node files from tests/fixtures/test_nodes/
to ensure the complete system works end-to-end in non-interactive mode.

Test nodes are loaded through QualibrationLibrary to ensure proper
initialization including filepath setting.
"""

import pytest

from qualibrate_runner.config.models import RunStatusEnum
from qualibrate_runner.core.run_job import run_node


class TestSimpleNodeExecution:
    """Integration tests for simple nodes without action system."""

    def test_simple_node_success(self, test_library, fresh_state):
        """Test successful execution of simple node."""
        node = test_library.nodes["node_raises_in_body"]

        # Execute through run_node (full orchestration)
        run_node(node, {}, fresh_state)

        # Verify state tracking
        assert fresh_state.last_run.status == RunStatusEnum.FINISHED
        assert fresh_state.last_run.completed_at is not None
        assert fresh_state.last_run.error is None

        # Verify node results
        assert node.results is not None
        assert "data" in node.results
        assert node.results["error_raised"] is False

    def test_simple_node_with_different_parameters(
        self, test_library, fresh_state
    ):
        """Test simple node with runtime parameter override."""
        node = test_library.nodes["node_raises_in_body"]

        # Execute with custom parameters
        params = {"amplitude": 0.8, "num_points": 5}
        run_node(node, params, fresh_state)

        # Verify execution succeeded
        assert fresh_state.last_run.status == RunStatusEnum.FINISHED
        assert fresh_state.last_run.passed_parameters == params

    def test_simple_node_error_in_body(self, test_library, fresh_state):
        """Test error capture when node body raises exception."""
        node = test_library.nodes["node_raises_in_body"]

        # Execute with should_fail=True
        params = {
            "should_fail": True,
            "error_message": "Test error from body",
            "error_type": "ValueError",
        }

        with pytest.raises(ValueError, match="Test error from body"):
            run_node(node, params, fresh_state)

        # Verify error was captured in state
        assert fresh_state.last_run.status == RunStatusEnum.ERROR
        assert fresh_state.last_run.error is not None
        assert "ValueError" in fresh_state.last_run.error.error_class
        assert "Test error from body" in fresh_state.last_run.error.message


class TestNodeWithActionsExecution:
    """Integration tests for nodes with action system."""

    def test_all_actions_execute(self, test_library, fresh_state):
        """Test full execution with all default actions."""
        node = test_library.nodes["node_with_actions"]

        # Execute with defaults
        run_node(node, {}, fresh_state)

        # Verify state tracking
        assert fresh_state.last_run.status == RunStatusEnum.FINISHED
        assert fresh_state.last_run.error is None

        # Verify all default actions executed
        assert "data" in node.namespace
        assert "processed_data" in node.namespace
        assert "state_updated" in node.namespace  # update_state defaults True
        assert "summary" in node.namespace

    def test_conditional_action_skip(self, test_library, fresh_state):
        """Test conditional action skipping via parameters."""
        node = test_library.nodes["node_with_actions"]

        # Execute with update_state=False to skip that action
        params = {"update_state": False}
        run_node(node, params, fresh_state)

        # Verify execution succeeded
        assert fresh_state.last_run.status == RunStatusEnum.FINISHED

        # Verify normal actions ran
        assert "data" in node.namespace
        assert "processed_data" in node.namespace

        # Verify conditional action was skipped
        assert "state_updated" not in node.namespace

    def test_action_raises_error(self, test_library, fresh_state):
        """Test error capture when action raises exception."""
        node = test_library.nodes["node_with_actions"]

        # Execute with trigger_error=True
        params = {
            "trigger_error": True,
            "error_message": "Test error from action",
        }

        with pytest.raises(ValueError, match="Test error from action"):
            run_node(node, params, fresh_state)

        # Verify error was captured
        assert fresh_state.last_run.status == RunStatusEnum.ERROR
        assert fresh_state.last_run.error is not None
        assert "ValueError" in fresh_state.last_run.error.error_class

    def test_error_from_external_library(self, test_library, fresh_state):
        """Test error propagation from external library code."""
        node = test_library.nodes["node_with_actions"]

        # Execute with trigger_deep_error=True
        params = {"trigger_deep_error": True}

        # This should raise an error from inside XarrayDataFetcher
        with pytest.raises(KeyError):
            run_node(node, params, fresh_state)

        # Verify error was captured
        assert fresh_state.last_run.status == RunStatusEnum.ERROR
        assert fresh_state.last_run.error is not None


class TestNamespaceAccumulation:
    """Integration tests for namespace data flow across actions."""

    def test_namespace_accumulates_across_actions(
        self, test_library, fresh_state
    ):
        """Test that namespace accumulates data from all actions."""
        node = test_library.nodes["node_with_actions"]

        run_node(node, {}, fresh_state)

        # Verify data from each action is in namespace
        # From prepare_data
        assert "data" in node.namespace
        assert "data_length" in node.namespace

        # From process_data
        assert "processed_data" in node.namespace
        assert "mean" in node.namespace

        # From finalize_results
        assert "summary" in node.namespace

    def test_later_actions_use_earlier_data(self, test_library, fresh_state):
        """Test that actions can access data from previous actions."""
        node = test_library.nodes["node_with_actions"]

        run_node(node, {}, fresh_state)

        # process_data uses data from prepare_data
        raw_data = node.namespace["data"]
        processed_data = node.namespace["processed_data"]

        # Verify processing is correct (doubles each value)
        assert len(processed_data) == len(raw_data)
        for i in range(len(raw_data)):
            assert processed_data[i] == raw_data[i] * 2


class TestStateTracking:
    """Integration tests for state lifecycle management."""

    def test_state_lifecycle_success(self, test_library, fresh_state):
        """Test state transitions during successful execution."""
        node = test_library.nodes["node_with_actions"]

        # Initial state
        assert fresh_state.last_run is None

        # Execute
        run_node(node, {}, fresh_state)

        # Final state
        assert fresh_state.last_run is not None
        assert fresh_state.last_run.status == RunStatusEnum.FINISHED
        assert fresh_state.last_run.started_at is not None
        assert fresh_state.last_run.completed_at is not None
        assert (
            fresh_state.last_run.completed_at
            >= fresh_state.last_run.started_at
        )

    def test_state_lifecycle_with_error(self, test_library, fresh_state):
        """Test state updates when execution fails."""
        node = test_library.nodes["node_with_actions"]

        # Execute with error
        params = {"trigger_error": True}

        with pytest.raises(ValueError):
            run_node(node, params, fresh_state)

        # State should be updated even on error
        assert fresh_state.last_run is not None
        assert fresh_state.last_run.status == RunStatusEnum.ERROR
        assert fresh_state.last_run.error is not None
        assert fresh_state.last_run.completed_at is not None

    def test_passed_parameters_captured(self, test_library, fresh_state):
        """Test that passed parameters are captured in state."""
        node = test_library.nodes["node_with_actions"]

        params = {
            "amplitude": 0.7,
            "num_points": 8,
            "update_state": False,
        }

        run_node(node, params, fresh_state)

        # Verify parameters were captured
        assert fresh_state.last_run.passed_parameters == params


class TestParametricBehavior:
    """Integration tests for parametric node behavior."""

    def test_namespace_persists_across_runs(self, test_library, fresh_state):
        """Test that namespace accumulates across multiple runs"""
        node = test_library.nodes["node_with_actions"]

        # First execution: normal (with update_state=True by default)
        run_node(node, {}, fresh_state)
        assert fresh_state.last_run.status == RunStatusEnum.FINISHED
        assert "state_updated" in node.namespace
        first_run_keys = set(node.namespace.keys())

        # Second execution: namespace should accumulate, not reset
        run_node(node, {"update_state": False}, fresh_state)
        assert fresh_state.last_run.status == RunStatusEnum.FINISHED
        # Verify namespace accumulated - all keys from first run still present
        assert first_run_keys.issubset(set(node.namespace.keys()))
        # "state_updated" still present from first run (correct behavior)
        assert "state_updated" in node.namespace

    def test_error_execution_preserves_namespace(
        self, test_library, fresh_state
    ):
        """Test that namespace is preserved even when execution fails."""
        node = test_library.nodes["node_with_actions"]

        # First execution: normal
        run_node(node, {}, fresh_state)
        assert fresh_state.last_run.status == RunStatusEnum.FINISHED
        successful_run_keys = set(node.namespace.keys())

        # Second execution: trigger error
        with pytest.raises(ValueError):
            run_node(node, {"trigger_error": True}, fresh_state)
        assert fresh_state.last_run.status == RunStatusEnum.ERROR

        # Namespace from successful run should still be present
        assert successful_run_keys.issubset(set(node.namespace.keys()))
