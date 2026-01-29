"""
Tests for ActionManager class (non-interactive mode only).
"""

from unittest.mock import Mock, patch

import pytest

from qualibrate.core.runnables.run_action.action import Action
from qualibrate.core.runnables.run_action.action_manager import ActionManager


class TestActionManagerInit:
    """Tests for ActionManager initialization."""

    def test_init_creates_empty_actions_dict(self, action_manager):
        """Test that __init__ creates an empty actions dict."""
        assert action_manager.actions == {}
        assert isinstance(action_manager.actions, dict)

    def test_init_sets_current_action_to_none(self, action_manager):
        """Test that current_action is initially None."""
        assert action_manager.current_action is None

    def test_init_sets_skip_actions_to_false(self, action_manager):
        """Test that skip_actions defaults to False."""
        assert action_manager.skip_actions is False
        assert action_manager._skip_actions is False

    def test_init_captures_predefined_names(self):
        """Test that predefined_names are captured from frame."""
        test_names = {"x", "y", "print", "len"}

        with (
            patch("qualibrate.core.runnables.run_action.action_manager.inspect.stack"),
            patch("qualibrate.core.runnables.run_action.action_manager.get_frame_for_keeping_names_from_manager"),
            patch(
                "qualibrate.core.runnables.run_action.action_manager.get_defined_in_frame_names",
                return_value=test_names,
            ),
        ):
            manager = ActionManager()

        assert manager.predefined_names == test_names
        assert "x" in manager.predefined_names
        assert "print" in manager.predefined_names


class TestSkipActionsProperty:
    """Tests for the skip_actions property."""

    def test_set_skip_actions_true(self, action_manager):
        """Test setting skip_actions to True (skip all)."""
        action_manager.skip_actions = True

        assert action_manager.skip_actions is True
        assert action_manager._skip_actions is True
        assert action_manager._skip_actions_names == set()

    def test_set_skip_actions_false(self, action_manager):
        """Test setting skip_actions to False (run all)."""
        action_manager.skip_actions = False

        assert action_manager.skip_actions is False
        assert action_manager._skip_actions is False
        assert action_manager._skip_actions_names == set()

    def test_set_skip_actions_with_list(self, action_manager):
        """Test setting skip_actions to a list of action names."""
        action_manager.skip_actions = ["action1", "action2"]

        assert action_manager.skip_actions is True  # Flag is set
        assert action_manager._skip_actions_names == {"action1", "action2"}

    def test_set_skip_actions_with_empty_list(self, action_manager):
        """Test setting skip_actions to empty list (skip none)."""
        action_manager.skip_actions = []

        assert action_manager.skip_actions is True  # Flag is set
        assert action_manager._skip_actions_names == set()

    def test_set_skip_actions_with_single_item_list(self, action_manager):
        """Test setting skip_actions to single-item list."""
        action_manager.skip_actions = ["single_action"]

        assert action_manager._skip_actions_names == {"single_action"}

    def test_set_skip_actions_invalid_type_raises(self, action_manager):
        """Test that invalid types raise TypeError."""
        with pytest.raises(TypeError, match="Invalid value.*for skip_actions"):
            action_manager.skip_actions = 123  # Invalid type

    def test_set_skip_actions_list_with_non_strings_raises(self, action_manager):
        """Test that list with non-string items raises TypeError."""
        with pytest.raises(TypeError, match="Invalid value.*for skip_actions"):
            action_manager.skip_actions = ["action1", 123, "action2"]

    def test_toggle_skip_actions_between_modes(self, action_manager):
        """Test toggling between bool and list modes."""
        # Start with list mode
        action_manager.skip_actions = ["action1"]
        assert action_manager._skip_actions_names == {"action1"}

        # Switch to bool mode (clears names)
        action_manager.skip_actions = True
        assert action_manager._skip_actions_names == set()

        # Switch back to list mode
        action_manager.skip_actions = ["action2", "action3"]
        assert action_manager._skip_actions_names == {"action2", "action3"}

        # Disable skipping
        action_manager.skip_actions = False
        assert action_manager._skip_actions is False
        assert action_manager._skip_actions_names == set()


class TestRunAction:
    """Tests for the run_action method."""

    @pytest.fixture
    def mock_action(self):
        """Provide a mock Action."""
        action = Mock(spec=Action)
        action.execute_run_action = Mock(return_value={"result": "success"})
        return action

    def test_run_action_executes_found_action(self, action_manager, mock_node, mock_action):
        """Test that run_action executes a registered action."""
        action_manager.actions["test_action"] = mock_action

        result = action_manager.run_action("test_action", mock_node)

        mock_action.execute_run_action.assert_called_once_with(mock_node)
        assert result == {"result": "success"}

    def test_run_action_not_found_returns_none(self, action_manager, mock_node):
        """Test that run_action returns None for non-existent action."""
        result = action_manager.run_action("nonexistent", mock_node)

        assert result is None

    def test_run_action_not_found_logs_warning(self, action_manager, mock_node, caplog):
        """Test that missing action logs a warning."""
        action_manager.run_action("nonexistent", mock_node)

        assert "Can't run action nonexistent" in caplog.text

    def test_run_action_respects_skip_all(self, action_manager, mock_node, mock_action):
        """Test that skip_actions=True skips all actions."""
        action_manager.actions["test_action"] = mock_action
        action_manager.skip_actions = True

        result = action_manager.run_action("test_action", mock_node)

        mock_action.execute_run_action.assert_not_called()
        assert result is None

    def test_run_action_respects_skip_specific(self, action_manager, mock_node, mock_action):
        """Test that skip_actions with list skips specific actions."""
        action_manager.actions["action1"] = mock_action
        action_manager.actions["action2"] = Mock(spec=Action)
        action_manager.skip_actions = ["action1"]

        # action1 should be skipped
        result1 = action_manager.run_action("action1", mock_node)
        assert result1 is None
        mock_action.execute_run_action.assert_not_called()

        # action2 should run
        action_manager.run_action("action2", mock_node)
        action_manager.actions["action2"].execute_run_action.assert_called_once()

    def test_run_action_with_args_kwargs(self, action_manager, mock_node, mock_action):
        """Test that run_action passes args and kwargs to action."""
        action_manager.actions["test_action"] = mock_action

        action_manager.run_action("test_action", mock_node, "arg1", key="value")

        mock_action.execute_run_action.assert_called_once_with(mock_node, "arg1", key="value")

    def test_run_action_skip_logs_info(self, action_manager, mock_node, mock_action, caplog):
        """Test that skipped action logs info message."""
        action_manager.actions["test_action"] = mock_action
        action_manager.skip_actions = True

        action_manager.run_action("test_action", mock_node)

        assert "Skipping action test_action" in caplog.text


class TestRegisterAction:
    """Tests for the register_action decorator."""

    def test_register_without_parentheses_registers_action(self, action_manager, mock_node, non_interactive_mode):
        """Test @decorator syntax registers the action."""
        mock_node._action_manager = action_manager

        @action_manager.register_action(mock_node)
        def test_action(node):
            return {"value": 42}

        assert "test_action" in action_manager.actions
        assert isinstance(action_manager.actions["test_action"], Action)

    def test_register_without_parentheses_executes_immediately(self, action_manager, mock_node, non_interactive_mode):
        """Test @decorator syntax executes action immediately."""
        mock_node._action_manager = action_manager
        execution_count = {"count": 0}

        @action_manager.register_action(mock_node)
        def test_action(node):
            execution_count["count"] += 1
            return {"value": 42}

        # Action should have executed once during registration
        assert execution_count["count"] == 1

    def test_register_with_skip_if_false_executes(self, action_manager, mock_node, non_interactive_mode):
        """Test @decorator(skip_if=False) executes immediately."""
        mock_node._action_manager = action_manager
        execution_count = {"count": 0}

        @action_manager.register_action(mock_node, skip_if=False)
        def test_action(node):
            execution_count["count"] += 1
            return {"value": 42}

        assert execution_count["count"] == 1

    def test_register_with_skip_if_true_does_not_execute(self, action_manager, mock_node, non_interactive_mode):
        """Test @decorator(skip_if=True) does NOT execute immediately."""
        mock_node._action_manager = action_manager
        execution_count = {"count": 0}

        @action_manager.register_action(mock_node, skip_if=True)
        def test_action(node):
            execution_count["count"] += 1
            return {"value": 42}

        # Action should be registered but NOT executed
        assert "test_action" in action_manager.actions
        assert execution_count["count"] == 0

    def test_register_returns_callable_wrapper(self, action_manager, mock_node, non_interactive_mode):
        """Test that register_action returns a callable wrapper."""
        mock_node._action_manager = action_manager

        @action_manager.register_action(mock_node)
        def test_action(node):
            return {"value": 42}

        assert callable(test_action)

    def test_wrapper_can_be_called_again(self, action_manager, mock_node, non_interactive_mode):
        """Test that the wrapper function can be called multiple times."""
        mock_node._action_manager = action_manager
        execution_count = {"count": 0}

        @action_manager.register_action(mock_node)
        def test_action(node):
            execution_count["count"] += 1
            return {"value": execution_count["count"]}

        # Already executed once during registration
        assert execution_count["count"] == 1

        # Call again manually
        result = test_action()
        assert execution_count["count"] == 2
        assert result == {"value": 2}

        # Call one more time
        result = test_action()
        assert execution_count["count"] == 3
        assert result == {"value": 3}

    def test_wrapper_preserves_function_metadata(self, action_manager, mock_node, non_interactive_mode):
        """Test that wrapper preserves original function metadata."""
        mock_node._action_manager = action_manager

        @action_manager.register_action(mock_node, skip_if=True)
        def test_action(node):
            """Test docstring."""
            return {"value": 42}

        assert test_action.__name__ == "test_action"
        assert test_action.__doc__ == "Test docstring."

    def test_multiple_actions_registered_sequentially(self, action_manager, mock_node, non_interactive_mode):
        """Test registering multiple actions in sequence."""
        mock_node._action_manager = action_manager

        @action_manager.register_action(mock_node, skip_if=True)
        def action1(node):
            return {"a": 1}

        @action_manager.register_action(mock_node, skip_if=True)
        def action2(node):
            return {"b": 2}

        @action_manager.register_action(mock_node, skip_if=True)
        def action3(node):
            return {"c": 3}

        assert len(action_manager.actions) == 3
        assert "action1" in action_manager.actions
        assert "action2" in action_manager.actions
        assert "action3" in action_manager.actions

    def test_register_action_with_node_namespace_update(self, action_manager, mock_node, non_interactive_mode):
        """Test that action updates node.namespace when returning dict."""
        mock_node._action_manager = action_manager

        @action_manager.register_action(mock_node)
        def test_action(node):
            return {"computed": True, "value": 100}

        # Namespace should be updated (action executed during registration)
        assert mock_node.namespace.get("computed") is True
        assert mock_node.namespace.get("value") == 100
