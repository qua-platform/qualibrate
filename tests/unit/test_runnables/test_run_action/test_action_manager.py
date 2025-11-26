"""
Tests for ActionManager class (non-interactive mode only).
"""

from unittest.mock import Mock, patch

import pytest

from qualibrate.runnables.run_action.action import Action
from qualibrate.runnables.run_action.action_manager import ActionManager


class TestActionManagerInit:
    """Tests for ActionManager initialization."""

    def test_init_creates_empty_actions_dict(self):
        """Test that __init__ creates an empty actions dict."""
        with (
            patch(
                "qualibrate.runnables.run_action.action_manager.inspect.stack"
            ),
            patch(
                "qualibrate.runnables.run_action.action_manager"
                ".get_frame_for_keeping_names_from_manager"
            ),
            patch(
                "qualibrate.runnables.run_action.action_manager"
                ".get_defined_in_frame_names",
                return_value=set(),
            ),
        ):
            manager = ActionManager()

        assert manager.actions == {}
        assert isinstance(manager.actions, dict)

    def test_init_sets_current_action_to_none(self):
        """Test that current_action is initially None."""
        with (
            patch(
                "qualibrate.runnables.run_action.action_manager.inspect.stack"
            ),
            patch(
                "qualibrate.runnables.run_action.action_manager"
                ".get_frame_for_keeping_names_from_manager"
            ),
            patch(
                "qualibrate.runnables.run_action.action_manager"
                ".get_defined_in_frame_names",
                return_value=set(),
            ),
        ):
            manager = ActionManager()

        assert manager.current_action is None

    def test_init_sets_skip_actions_to_false(self):
        """Test that skip_actions defaults to False."""
        with (
            patch(
                "qualibrate.runnables.run_action.action_manager.inspect.stack"
            ),
            patch(
                "qualibrate.runnables.run_action.action_manager"
                ".get_frame_for_keeping_names_from_manager"
            ),
            patch(
                "qualibrate.runnables.run_action.action_manager"
                ".get_defined_in_frame_names",
                return_value=set(),
            ),
        ):
            manager = ActionManager()

        assert manager.skip_actions is False
        assert manager._skip_actions is False

    def test_init_captures_predefined_names(self):
        """Test that predefined_names are captured from frame."""
        test_names = {"x", "y", "print", "len"}

        with (
            patch(
                "qualibrate.runnables.run_action.action_manager.inspect.stack"
            ),
            patch(
                "qualibrate.runnables.run_action.action_manager"
                ".get_frame_for_keeping_names_from_manager"
            ),
            patch(
                "qualibrate.runnables.run_action.action_manager"
                ".get_defined_in_frame_names",
                return_value=test_names,
            ),
        ):
            manager = ActionManager()

        assert manager.predefined_names == test_names
        assert "x" in manager.predefined_names
        assert "print" in manager.predefined_names


class TestSkipActionsProperty:
    """Tests for the skip_actions property."""

    @pytest.fixture
    def manager(self):
        """Provide an ActionManager instance."""
        with (
            patch(
                "qualibrate.runnables.run_action.action_manager.inspect.stack"
            ),
            patch(
                "qualibrate.runnables.run_action.action_manager"
                ".get_frame_for_keeping_names_from_manager"
            ),
            patch(
                "qualibrate.runnables.run_action.action_manager"
                ".get_defined_in_frame_names",
                return_value=set(),
            ),
        ):
            return ActionManager()

    def test_set_skip_actions_true(self, manager):
        """Test setting skip_actions to True (skip all)."""
        manager.skip_actions = True

        assert manager.skip_actions is True
        assert manager._skip_actions is True
        assert manager._skip_actions_names == set()

    def test_set_skip_actions_false(self, manager):
        """Test setting skip_actions to False (run all)."""
        manager.skip_actions = False

        assert manager.skip_actions is False
        assert manager._skip_actions is False
        assert manager._skip_actions_names == set()

    def test_set_skip_actions_with_list(self, manager):
        """Test setting skip_actions to a list of action names."""
        manager.skip_actions = ["action1", "action2"]

        assert manager.skip_actions is True  # Flag is set
        assert manager._skip_actions_names == {"action1", "action2"}

    def test_set_skip_actions_with_empty_list(self, manager):
        """Test setting skip_actions to empty list (skip none)."""
        manager.skip_actions = []

        assert manager.skip_actions is True  # Flag is set
        assert manager._skip_actions_names == set()

    def test_set_skip_actions_with_single_item_list(self, manager):
        """Test setting skip_actions to single-item list."""
        manager.skip_actions = ["single_action"]

        assert manager._skip_actions_names == {"single_action"}

    def test_set_skip_actions_invalid_type_raises(self, manager):
        """Test that invalid types raise TypeError."""
        with pytest.raises(TypeError, match="Invalid value.*for skip_actions"):
            manager.skip_actions = 123  # Invalid type

    def test_set_skip_actions_list_with_non_strings_raises(self, manager):
        """Test that list with non-string items raises TypeError."""
        with pytest.raises(TypeError, match="Invalid value.*for skip_actions"):
            manager.skip_actions = ["action1", 123, "action2"]

    def test_toggle_skip_actions_between_modes(self, manager):
        """Test toggling between bool and list modes."""
        # Start with list mode
        manager.skip_actions = ["action1"]
        assert manager._skip_actions_names == {"action1"}

        # Switch to bool mode (clears names)
        manager.skip_actions = True
        assert manager._skip_actions_names == set()

        # Switch back to list mode
        manager.skip_actions = ["action2", "action3"]
        assert manager._skip_actions_names == {"action2", "action3"}

        # Disable skipping
        manager.skip_actions = False
        assert manager._skip_actions is False
        assert manager._skip_actions_names == set()


class TestRunAction:
    """Tests for the run_action method."""

    @pytest.fixture
    def manager(self):
        """Provide an ActionManager instance."""
        with (
            patch(
                "qualibrate.runnables.run_action.action_manager.inspect.stack"
            ),
            patch(
                "qualibrate.runnables.run_action.action_manager"
                ".get_frame_for_keeping_names_from_manager"
            ),
            patch(
                "qualibrate.runnables.run_action.action_manager"
                ".get_defined_in_frame_names",
                return_value=set(),
            ),
        ):
            return ActionManager()

    @pytest.fixture
    def mock_node(self):
        """Provide a mock QualibrationNode."""
        node = Mock()
        node.name = "test_node"
        node.namespace = {}
        return node

    @pytest.fixture
    def mock_action(self):
        """Provide a mock Action."""
        action = Mock(spec=Action)
        action.execute_run_action = Mock(return_value={"result": "success"})
        return action

    def test_run_action_executes_found_action(
        self, manager, mock_node, mock_action
    ):
        """Test that run_action executes a registered action."""
        manager.actions["test_action"] = mock_action

        result = manager.run_action("test_action", mock_node)

        mock_action.execute_run_action.assert_called_once_with(mock_node)
        assert result == {"result": "success"}

    def test_run_action_not_found_returns_none(self, manager, mock_node):
        """Test that run_action returns None for non-existent action."""
        result = manager.run_action("nonexistent", mock_node)

        assert result is None

    def test_run_action_not_found_logs_warning(
        self, manager, mock_node, caplog
    ):
        """Test that missing action logs a warning."""
        manager.run_action("nonexistent", mock_node)

        assert "Can't run action nonexistent" in caplog.text

    def test_run_action_respects_skip_all(
        self, manager, mock_node, mock_action
    ):
        """Test that skip_actions=True skips all actions."""
        manager.actions["test_action"] = mock_action
        manager.skip_actions = True

        result = manager.run_action("test_action", mock_node)

        mock_action.execute_run_action.assert_not_called()
        assert result is None

    def test_run_action_respects_skip_specific(
        self, manager, mock_node, mock_action
    ):
        """Test that skip_actions with list skips specific actions."""
        manager.actions["action1"] = mock_action
        manager.actions["action2"] = Mock(spec=Action)
        manager.skip_actions = ["action1"]

        # action1 should be skipped
        result1 = manager.run_action("action1", mock_node)
        assert result1 is None
        mock_action.execute_run_action.assert_not_called()

        # action2 should run
        manager.run_action("action2", mock_node)
        manager.actions["action2"].execute_run_action.assert_called_once()

    def test_run_action_with_args_kwargs(self, manager, mock_node, mock_action):
        """Test that run_action passes args and kwargs to action."""
        manager.actions["test_action"] = mock_action

        manager.run_action("test_action", mock_node, "arg1", key="value")

        mock_action.execute_run_action.assert_called_once_with(
            mock_node, "arg1", key="value"
        )

    def test_run_action_skip_logs_info(
        self, manager, mock_node, mock_action, caplog
    ):
        """Test that skipped action logs info message."""
        manager.actions["test_action"] = mock_action
        manager.skip_actions = True

        manager.run_action("test_action", mock_node)

        assert "Skipping action test_action" in caplog.text


class TestRegisterAction:
    """Tests for the register_action decorator."""

    @pytest.fixture
    def manager(self):
        """Provide an ActionManager instance."""
        with (
            patch(
                "qualibrate.runnables.run_action.action_manager.inspect.stack"
            ),
            patch(
                "qualibrate.runnables.run_action.action_manager"
                ".get_frame_for_keeping_names_from_manager"
            ),
            patch(
                "qualibrate.runnables.run_action.action_manager"
                ".get_defined_in_frame_names",
                return_value=set(),
            ),
        ):
            return ActionManager()

    @pytest.fixture
    def mock_node(self):
        """Provide a mock QualibrationNode."""
        node = Mock()
        node.name = "test_node"
        node.namespace = {}
        node._action_manager = None  # Will be set in tests
        return node

    def test_register_without_parentheses_registers_action(
        self, manager, mock_node, non_interactive_mode
    ):
        """Test @decorator syntax registers the action."""
        mock_node._action_manager = manager

        @manager.register_action(mock_node)
        def test_action(node):
            return {"value": 42}

        assert "test_action" in manager.actions
        assert isinstance(manager.actions["test_action"], Action)

    def test_register_without_parentheses_executes_immediately(
        self, manager, mock_node, non_interactive_mode
    ):
        """Test @decorator syntax executes action immediately."""
        mock_node._action_manager = manager
        execution_count = {"count": 0}

        @manager.register_action(mock_node)
        def test_action(node):
            execution_count["count"] += 1
            return {"value": 42}

        # Action should have executed once during registration
        assert execution_count["count"] == 1

    def test_register_with_skip_if_false_executes(
        self, manager, mock_node, non_interactive_mode
    ):
        """Test @decorator(skip_if=False) executes immediately."""
        mock_node._action_manager = manager
        execution_count = {"count": 0}

        @manager.register_action(mock_node, skip_if=False)
        def test_action(node):
            execution_count["count"] += 1
            return {"value": 42}

        assert execution_count["count"] == 1

    def test_register_with_skip_if_true_does_not_execute(
        self, manager, mock_node, non_interactive_mode
    ):
        """Test @decorator(skip_if=True) does NOT execute immediately."""
        mock_node._action_manager = manager
        execution_count = {"count": 0}

        @manager.register_action(mock_node, skip_if=True)
        def test_action(node):
            execution_count["count"] += 1
            return {"value": 42}

        # Action should be registered but NOT executed
        assert "test_action" in manager.actions
        assert execution_count["count"] == 0

    def test_register_returns_callable_wrapper(
        self, manager, mock_node, non_interactive_mode
    ):
        """Test that register_action returns a callable wrapper."""
        mock_node._action_manager = manager

        @manager.register_action(mock_node)
        def test_action(node):
            return {"value": 42}

        assert callable(test_action)

    def test_wrapper_can_be_called_again(
        self, manager, mock_node, non_interactive_mode
    ):
        """Test that the wrapper function can be called multiple times."""
        mock_node._action_manager = manager
        execution_count = {"count": 0}

        @manager.register_action(mock_node)
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

    def test_wrapper_preserves_function_metadata(
        self, manager, mock_node, non_interactive_mode
    ):
        """Test that wrapper preserves original function metadata."""
        mock_node._action_manager = manager

        @manager.register_action(mock_node, skip_if=True)
        def test_action(node):
            """Test docstring."""
            return {"value": 42}

        assert test_action.__name__ == "test_action"
        assert test_action.__doc__ == "Test docstring."

    def test_multiple_actions_registered_sequentially(
        self, manager, mock_node, non_interactive_mode
    ):
        """Test registering multiple actions in sequence."""
        mock_node._action_manager = manager

        @manager.register_action(mock_node, skip_if=True)
        def action1(node):
            return {"a": 1}

        @manager.register_action(mock_node, skip_if=True)
        def action2(node):
            return {"b": 2}

        @manager.register_action(mock_node, skip_if=True)
        def action3(node):
            return {"c": 3}

        assert len(manager.actions) == 3
        assert "action1" in manager.actions
        assert "action2" in manager.actions
        assert "action3" in manager.actions

    def test_register_action_with_node_namespace_update(
        self, manager, mock_node, non_interactive_mode
    ):
        """Test that action updates node.namespace when returning dict."""
        mock_node._action_manager = manager

        @manager.register_action(mock_node)
        def test_action(node):
            return {"computed": True, "value": 100}

        # Namespace should be updated (action executed during registration)
        assert mock_node.namespace.get("computed") is True
        assert mock_node.namespace.get("value") == 100
