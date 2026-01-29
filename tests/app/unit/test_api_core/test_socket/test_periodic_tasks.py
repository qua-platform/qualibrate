"""Tests for the repeat_every periodic task decorator."""

import asyncio
from unittest.mock import AsyncMock, Mock

import pytest

from qualibrate.app.api.core.socket.periodic_tasks import (
    _handle_exc,
    _handle_func,
    repeat_every,
)


class TestHandleFunc:
    """Tests for _handle_func helper."""

    @pytest.mark.asyncio
    async def test_async_function_is_awaited(self):
        """Test that async functions are awaited directly."""
        mock_func = AsyncMock()

        await _handle_func(mock_func)

        mock_func.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_sync_function_runs_in_threadpool(self, mocker):
        """Test that sync functions are run in threadpool."""
        mock_func = Mock()
        run_in_threadpool = mocker.patch(
            "qualibrate.app.api.core.socket.periodic_tasks.run_in_threadpool",
            new_callable=AsyncMock,
        )

        await _handle_func(mock_func)

        run_in_threadpool.assert_awaited_once_with(mock_func)
        mock_func.assert_not_called()


class TestHandleExc:
    """Tests for _handle_exc helper."""

    @pytest.mark.asyncio
    async def test_none_handler_does_nothing(self):
        """Test that None on_exception handler is a no-op."""
        exc = ValueError("test error")

        # Should not raise
        await _handle_exc(exc, None)

    @pytest.mark.asyncio
    async def test_async_handler_is_awaited(self):
        """Test that async exception handlers are awaited."""
        exc = ValueError("test error")
        handler = AsyncMock()

        await _handle_exc(exc, handler)

        handler.assert_awaited_once_with(exc)

    @pytest.mark.asyncio
    async def test_sync_handler_runs_in_threadpool(self, mocker):
        """Test that sync exception handlers run in threadpool."""
        exc = ValueError("test error")
        handler = Mock()
        run_in_threadpool = mocker.patch(
            "qualibrate.app.api.core.socket.periodic_tasks.run_in_threadpool",
            new_callable=AsyncMock,
        )

        await _handle_exc(exc, handler)

        run_in_threadpool.assert_awaited_once_with(handler, exc)
        handler.assert_not_called()


class TestRepeatEvery:
    """Tests for the repeat_every decorator."""

    @pytest.mark.asyncio
    async def test_returns_asyncio_task(self):
        """Test that decorated function returns an asyncio.Task."""
        call_count = 0

        @repeat_every(seconds=0.1)
        async def periodic_func():
            nonlocal call_count
            call_count += 1

        task = await periodic_func()

        assert isinstance(task, asyncio.Task)
        # Clean up
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass

    @pytest.mark.asyncio
    async def test_task_runs_periodically(self):
        """Test that the task runs the function periodically."""
        call_count = 0

        @repeat_every(seconds=0.05)
        async def periodic_func():
            nonlocal call_count
            call_count += 1

        task = await periodic_func()

        # Wait for multiple executions
        await asyncio.sleep(0.15)

        # Should have run at least 2-3 times
        assert call_count >= 2

        # Clean up
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass

    @pytest.mark.asyncio
    async def test_task_can_be_cancelled(self):
        """Test that the returned task can be cancelled."""
        call_count = 0

        @repeat_every(seconds=0.05)
        async def periodic_func():
            nonlocal call_count
            call_count += 1

        task = await periodic_func()

        # Let it run once
        await asyncio.sleep(0.06)
        initial_count = call_count

        # Cancel the task
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass

        # Wait and verify no more executions
        await asyncio.sleep(0.1)
        assert call_count == initial_count

    @pytest.mark.asyncio
    async def test_exception_calls_handler(self):
        """Test that exceptions are passed to on_exception handler."""
        exceptions_received = []

        def on_exception(exc):
            exceptions_received.append(exc)

        @repeat_every(seconds=0.05, on_exception=on_exception)
        async def periodic_func():
            raise ValueError("test error")

        task = await periodic_func()

        # Wait for exception to occur
        await asyncio.sleep(0.1)

        assert len(exceptions_received) >= 1
        assert isinstance(exceptions_received[0], ValueError)
        assert str(exceptions_received[0]) == "test error"

        # Clean up
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass

    @pytest.mark.asyncio
    async def test_exception_does_not_stop_loop(self):
        """Test that exceptions don't stop the periodic execution."""
        call_count = 0

        @repeat_every(seconds=0.05, on_exception=lambda e: None)
        async def periodic_func():
            nonlocal call_count
            call_count += 1
            if call_count <= 2:
                raise ValueError("test error")

        task = await periodic_func()

        # Wait for multiple executions
        await asyncio.sleep(0.2)

        # Should have continued past the exceptions
        assert call_count >= 3

        # Clean up
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass

    @pytest.mark.asyncio
    async def test_async_exception_handler(self):
        """Test that async exception handlers work."""
        exceptions_received = []

        async def on_exception(exc):
            exceptions_received.append(exc)

        @repeat_every(seconds=0.05, on_exception=on_exception)
        async def periodic_func():
            raise RuntimeError("async handler test")

        task = await periodic_func()

        # Wait for exception to occur
        await asyncio.sleep(0.1)

        assert len(exceptions_received) >= 1
        assert isinstance(exceptions_received[0], RuntimeError)

        # Clean up
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass

    @pytest.mark.asyncio
    async def test_sync_function_decorated(self, mocker):
        """Test that sync functions can be decorated and run."""
        call_count = 0

        # Mock run_in_threadpool to simulate sync function execution
        async def mock_run_in_threadpool(func):
            nonlocal call_count
            call_count += 1

        mocker.patch(
            "qualibrate.app.api.core.socket.periodic_tasks.run_in_threadpool",
            side_effect=mock_run_in_threadpool,
        )

        @repeat_every(seconds=0.05)
        def sync_func():
            pass  # This won't actually run due to mock

        task = await sync_func()

        # Wait for executions
        await asyncio.sleep(0.15)

        assert call_count >= 2

        # Clean up
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass

    @pytest.mark.asyncio
    async def test_preserves_function_metadata(self):
        """Test that the decorator preserves function metadata."""

        @repeat_every(seconds=1)
        async def my_periodic_function():
            """Docstring for my function."""
            pass

        assert my_periodic_function.__name__ == "my_periodic_function"
        assert my_periodic_function.__doc__ == "Docstring for my function."
