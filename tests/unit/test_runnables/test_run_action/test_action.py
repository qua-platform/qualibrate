"""
Tests for Action class (non-interactive mode only).
"""

from unittest.mock import Mock, patch
import pytest

from qualibrate.runnables.run_action.action import Action


class TestActionNameProperty:
    """Tests for the name property."""

    @pytest.fixture
    def mock_manager(self):
        """Provide a mock ActionManager."""
        return Mock()

    def test_name_returns_function_name(
        self, simple_action_function, mock_manager
    ):
        """Test that name property returns function.__name__."""
        action = Action(simple_action_function, mock_manager)

        assert action.name == "action_func"

    def test_name_with_different_function_names(self, mock_manager):
        """Test name property with various function names."""

        def first_action(node):
            pass

        def second_action(node):
            pass

        def action_with_long_descriptive_name(node):
            pass

        action1 = Action(first_action, mock_manager)
        action2 = Action(second_action, mock_manager)
        action3 = Action(action_with_long_descriptive_name, mock_manager)

        assert action1.name == "first_action"
        assert action2.name == "second_action"
        assert action3.name == "action_with_long_descriptive_name"


class TestRunAndUpdateNamespace:
    """Tests for the _run_and_update_namespace method."""

    @pytest.fixture
    def mock_manager(self):
        """Provide a mock ActionManager."""
        return Mock()

    @pytest.fixture
    def mock_node(self):
        """Provide a mock QualibrationNode."""
        node = Mock()
        node.namespace = {}
        node.action_label = None
        return node

    def test_executes_function(self, mock_manager, mock_node):
        """Test that _run_and_update_namespace executes the function."""
        executed = {"called": False}

        def test_func(node):
            executed["called"] = True
            return {"result": "success"}

        action = Action(test_func, mock_manager)
        action._run_and_update_namespace(mock_node)

        assert executed["called"] is True

    def test_returns_function_result(self, mock_manager, mock_node):
        """Test that method returns the function's return value."""

        def test_func(node):
            return {"result": "success", "value": 42}

        action = Action(test_func, mock_manager)
        result = action._run_and_update_namespace(mock_node)

        assert result == {"result": "success", "value": 42}

    def test_updates_namespace_with_dict_return(
        self, mock_manager, mock_node
    ):
        """Test that dict returns update node.namespace."""

        def test_func(node):
            return {"x": 1, "y": 2, "z": 3}

        action = Action(test_func, mock_manager)
        action._run_and_update_namespace(mock_node)

        assert mock_node.namespace == {"x": 1, "y": 2, "z": 3}

    def test_no_namespace_update_with_none_return(
        self, mock_manager, mock_node
    ):
        """Test that None return doesn't update namespace."""

        def test_func(node):
            return None

        action = Action(test_func, mock_manager)
        action._run_and_update_namespace(mock_node)

        assert mock_node.namespace == {}

    def test_no_namespace_update_with_non_dict_return(
        self, mock_manager, mock_node
    ):
        """Test that non-dict returns don't update namespace."""

        def test_func(node):
            return "just a string"

        action = Action(test_func, mock_manager)
        action._run_and_update_namespace(mock_node)

        assert mock_node.namespace == {}

    def test_passes_args_to_function(self, mock_manager, mock_node):
        """Test that args are passed to the wrapped function."""
        received_args = []

        def test_func(node, *args):
            received_args.extend(args)
            return {"result": "success"}

        action = Action(test_func, mock_manager)
        action._run_and_update_namespace(mock_node, "arg1", "arg2", "arg3")

        assert received_args == ["arg1", "arg2", "arg3"]

    def test_passes_kwargs_to_function(self, mock_manager, mock_node):
        """Test that kwargs are passed to the wrapped function."""
        received_kwargs = {}

        def test_func(node, **kwargs):
            received_kwargs.update(kwargs)
            return {"result": "success"}

        action = Action(test_func, mock_manager)
        action._run_and_update_namespace(
            mock_node, key1="value1", key2="value2"
        )

        assert received_kwargs == {"key1": "value1", "key2": "value2"}

    def test_namespace_accumulates_across_actions(
        self, mock_manager, mock_node
    ):
        """Test that namespace accumulates values from multiple actions."""

        def action1(node):
            return {"a": 1, "b": 2}

        def action2(node):
            return {"c": 3, "d": 4}

        action_obj1 = Action(action1, mock_manager)
        action_obj2 = Action(action2, mock_manager)

        action_obj1._run_and_update_namespace(mock_node)
        action_obj2._run_and_update_namespace(mock_node)

        assert mock_node.namespace == {"a": 1, "b": 2, "c": 3, "d": 4}

    def test_later_action_can_overwrite_namespace_values(
        self, mock_manager, mock_node
    ):
        """Test that later actions can overwrite earlier namespace values."""

        def action1(node):
            return {"x": "first", "y": "original"}

        def action2(node):
            return {"x": "second"}  # Overwrites x

        action_obj1 = Action(action1, mock_manager)
        action_obj2 = Action(action2, mock_manager)

        action_obj1._run_and_update_namespace(mock_node)
        action_obj2._run_and_update_namespace(mock_node)

        assert mock_node.namespace == {"x": "second", "y": "original"}


class TestExecuteRunActionNonInteractive:
    """Tests for execute_run_action in non-interactive mode."""

    @pytest.fixture
    def mock_manager(self):
        """Provide a mock ActionManager."""
        manager = Mock()
        manager.current_action = None
        manager.predefined_names = set()
        return manager

    @pytest.fixture
    def mock_node(self):
        """Provide a mock QualibrationNode."""
        node = Mock()
        node.namespace = {}
        node.action_label = None
        return node

    def test_sets_current_action_during_execution(
        self, simple_action_function, mock_manager, mock_node, non_interactive_mode
    ):
        """Test that current_action is set during execution."""
        current_action_during_execution = []

        def tracking_func(node):
            current_action_during_execution.append(mock_manager.current_action)
            return {"result": "success"}

        action = Action(tracking_func, mock_manager)
        action.execute_run_action(mock_node)

        # Should have been set to self during execution
        assert len(current_action_during_execution) == 1
        assert current_action_during_execution[0] is action

    def test_clears_current_action_after_execution(
        self, simple_action_function, mock_manager, mock_node, non_interactive_mode
    ):
        """Test that current_action is cleared after execution."""
        action = Action(simple_action_function, mock_manager)
        action.execute_run_action(mock_node)

        assert mock_manager.current_action is None

    def test_clears_action_label_before_execution(
        self, simple_action_function, mock_manager, mock_node, non_interactive_mode
    ):
        """Test that action_label is cleared before execution."""
        mock_node.action_label = "previous_label"

        action = Action(simple_action_function, mock_manager)
        action.execute_run_action(mock_node)

        # Should have been cleared (set to None)
        assert mock_node.action_label is None

    def test_calls_run_and_update_namespace(
        self, mock_manager, mock_node, non_interactive_mode
    ):
        """Test that execute_run_action calls _run_and_update_namespace."""

        def test_func(node):
            return {"computed": True}

        action = Action(test_func, mock_manager)
        result = action.execute_run_action(mock_node)

        # Namespace should be updated
        assert mock_node.namespace == {"computed": True}
        assert result == {"computed": True}

    def test_returns_action_result(
        self, simple_action_function, mock_manager, mock_node, non_interactive_mode
    ):
        """Test that execute_run_action returns the action's result."""
        action = Action(simple_action_function, mock_manager)
        result = action.execute_run_action(mock_node)

        assert result == {"result": "success", "value": 42}

    def test_does_not_inject_variables_in_non_interactive_mode(
        self, simple_action_function, mock_manager, mock_node, non_interactive_mode
    ):
        """Test that variable injection is skipped in non-interactive mode."""
        # In non-interactive mode, is_interactive() returns False
        # so no frame manipulation should occur

        action = Action(simple_action_function, mock_manager)
        with patch(
            "qualibrate.runnables.run_action.action.get_frame_to_update_from_action"
        ) as mock_get_frame:
            result = action.execute_run_action(mock_node)

            # get_frame_to_update_from_action should NOT be called
            mock_get_frame.assert_not_called()

        # But result should still be returned and namespace updated
        assert result == {"result": "success", "value": 42}
        assert mock_node.namespace == {"result": "success", "value": 42}

    def test_handles_action_with_no_return(
        self, action_with_no_return, mock_manager, mock_node, non_interactive_mode
    ):
        """Test action that returns None."""
        action = Action(action_with_no_return, mock_manager)
        result = action.execute_run_action(mock_node)

        assert result is None
        # Namespace should not be updated (no dict returned)
        assert mock_node.namespace == {}

    def test_handles_action_with_non_dict_return(
        self, action_with_non_dict_return, mock_manager, mock_node, non_interactive_mode
    ):
        """Test action that returns a non-dict value."""
        action = Action(action_with_non_dict_return, mock_manager)
        result = action.execute_run_action(mock_node)

        assert result == "just a string"
        # Namespace should not be updated (not a dict)
        assert mock_node.namespace == {}

    def test_current_action_not_cleared_on_exception(
        self, action_that_raises, mock_manager, mock_node, non_interactive_mode
    ):
        """Test that current_action remains set if action raises.

        Note: The current implementation does NOT have a try-finally block,
        so current_action will not be cleared when an exception occurs.
        """
        action = Action(action_that_raises, mock_manager)

        with pytest.raises(ValueError, match="Test error from action"):
            action.execute_run_action(mock_node)

        # current_action is NOT cleared on exception
        assert mock_manager.current_action is action

    def test_exception_propagates_to_caller(
        self, action_that_raises, mock_manager, mock_node, non_interactive_mode
    ):
        """Test that exceptions from actions propagate correctly."""
        action = Action(action_that_raises, mock_manager)

        with pytest.raises(ValueError) as exc_info:
            action.execute_run_action(mock_node)

        assert "Test error from action" in str(exc_info.value)


class TestActionIntegration:
    """Integration tests for Action with ActionManager."""

    @pytest.fixture
    def mock_manager(self):
        """Provide a mock ActionManager."""
        manager = Mock()
        manager.current_action = None
        manager.predefined_names = set()
        manager.actions = {}
        return manager

    @pytest.fixture
    def mock_node(self):
        """Provide a mock QualibrationNode."""
        node = Mock()
        node.namespace = {}
        node.action_label = None
        return node

    def test_multiple_actions_share_namespace(
        self, mock_manager, mock_node, non_interactive_mode
    ):
        """Test that multiple actions can share the namespace."""

        def action1(node):
            return {"data": [1, 2, 3], "length": 3}

        def action2(node):
            # Access data from previous action
            data = node.namespace["data"]
            return {"sum": sum(data)}

        action_obj1 = Action(action1, mock_manager)
        action_obj2 = Action(action2, mock_manager)

        action_obj1.execute_run_action(mock_node)
        action_obj2.execute_run_action(mock_node)

        assert mock_node.namespace == {
            "data": [1, 2, 3],
            "length": 3,
            "sum": 6,
        }

    def test_action_tracking_across_multiple_executions(
        self, mock_manager, mock_node, non_interactive_mode
    ):
        """Test that current_action tracking works across multiple actions."""

        def action1(node):
            return {"first": True}

        def action2(node):
            return {"second": True}

        action_obj1 = Action(action1, mock_manager)
        action_obj2 = Action(action2, mock_manager)

        # Execute first action
        action_obj1.execute_run_action(mock_node)
        assert mock_manager.current_action is None

        # Execute second action
        action_obj2.execute_run_action(mock_node)
        assert mock_manager.current_action is None
