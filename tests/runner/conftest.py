"""
Shared fixtures for qualibrate-runner tests.

This module provides common fixtures used across unit and integration tests,
including mock objects, sample data, and test utilities.
"""

from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from typing import Any, cast
from unittest.mock import Mock, create_autospec

import pytest

from qualibrate.core import QualibrationGraph, QualibrationLibrary, QualibrationNode
from qualibrate.runner.config.models import State
from qualibrate.runner.core.models.common import RunError, StateUpdate
from qualibrate.runner.core.models.enums import RunnableType, RunStatusEnum
from qualibrate.runner.core.models.last_run import LastRun


@pytest.fixture
def aware_datetime() -> datetime:
    """Provide a timezone-aware datetime for testing."""
    return datetime(2024, 1, 15, 10, 30, 0, tzinfo=timezone.utc)


@pytest.fixture
def later_datetime() -> datetime:
    """Provide a later timezone-aware datetime for testing durations."""
    return datetime(2024, 1, 15, 10, 30, 5, 500000, tzinfo=timezone.utc)


@pytest.fixture
def sample_traceback() -> list[str]:
    """Provide a sample traceback as list of strings."""
    return [
        '  File "/path/to/node.py", line 42, in run\n    result = self.process_data()\n',
        '  File "/path/to/node.py", line 55, in process_data\n    raise ValueError("Invalid data")\n',
    ]


@pytest.fixture
def sample_run_error(sample_traceback: list[str]) -> RunError:
    """Provide a sample RunError instance."""
    return RunError(
        error_class="ValueError",
        message="Invalid data",
        traceback=sample_traceback,
    )


@pytest.fixture
def sample_state_update() -> StateUpdate:
    """Provide a sample StateUpdate instance."""
    return StateUpdate(
        key="qubit_0",
        attr="resonance_frequency",
        old=5.0e9,
        new=5.1e9,
        updated=True,
    )


@pytest.fixture
def sample_last_run_running(aware_datetime: datetime) -> LastRun:
    """Provide a LastRun instance with RUNNING status."""
    return LastRun(
        status=RunStatusEnum.RUNNING,
        started_at=aware_datetime,
        name="test_node",
        idx=-1,
        runnable_type=RunnableType.NODE,
        passed_parameters={},
    )


@pytest.fixture
def sample_last_run_finished(aware_datetime: datetime, later_datetime: datetime) -> LastRun:
    """Provide a LastRun instance with FINISHED status."""
    return LastRun(
        status=RunStatusEnum.FINISHED,
        started_at=aware_datetime,
        completed_at=later_datetime,
        name="test_node",
        idx=42,
        runnable_type=RunnableType.NODE,
        passed_parameters={"amplitude": 0.5},
        run_result=None,  # Must be None or a real RunSummary for validation
    )


@pytest.fixture
def sample_last_run_error(
    aware_datetime: datetime,
    later_datetime: datetime,
    sample_run_error: RunError,
) -> LastRun:
    """Provide a LastRun instance with ERROR status."""
    return LastRun(
        status=RunStatusEnum.ERROR,
        started_at=aware_datetime,
        completed_at=later_datetime,
        name="test_node",
        idx=-1,
        runnable_type=RunnableType.NODE,
        passed_parameters={},
        error=sample_run_error,
    )


@pytest.fixture
def fresh_state() -> State:
    """Provide a fresh State instance with no execution history."""
    return State()


@pytest.fixture(scope="function")
def mock_node() -> Mock:
    """Provide a mock QualibrationNode with enforced interface.

    Uses create_autospec to ensure the mock conforms to QualibrationNode's
    actual interface, catching typos and signature mismatches early.

    Scope is explicitly set to "function" to ensure each test gets a fresh
    mock instance with clean state (empty state_updates dict, no call history).
    This prevents test pollution from mutable state.

    Note: This cannot be used directly with State() due to Pydantic
    validation. Use state_with_node fixture instead.
    """
    node = cast(Mock, create_autospec(QualibrationNode, instance=True))

    node.name = "test_node"
    node.snapshot_idx = 42
    node.run_summary = None
    node.state_updates = {}

    return node


@pytest.fixture(scope="function")
def mock_workflow() -> Mock:
    """Provide a mock QualibrationGraph with enforced interface.

    Uses create_autospec to ensure the mock conforms to QualibrationGraph's
    actual interface, catching typos and signature mismatches early.

    Scope is explicitly set to "function" to ensure each test gets a fresh
    mock instance with clean call history. This prevents test pollution from
    accumulated mock state.

    Note: This cannot be used directly with State() due to Pydantic
    validation. Use state_with_workflow fixture instead.
    """
    workflow = cast(Mock, create_autospec(QualibrationGraph, instance=True))

    workflow.name = "test_workflow"
    workflow.snapshot_idx = 100
    workflow.run_summary = None

    return workflow


@pytest.fixture
def state_with_node(mock_node: Mock) -> State:
    """Provide a State with a mock node (bypassing validation)."""
    return State.model_construct(run_item=mock_node)


@pytest.fixture
def state_with_workflow(mock_workflow: Mock) -> State:
    """Provide a State with a mock workflow (bypassing validation)."""
    return State.model_construct(run_item=mock_workflow)


# Run job fixtures


@pytest.fixture
def mock_library(mock_workflow: Mock) -> Mock:
    """Provide a mock QualibrationLibrary."""
    library = Mock()
    library.graphs = {"test_workflow": mock_workflow}
    return library


@pytest.fixture
def sample_parameters_class() -> type[Any]:
    """Provide a sample Pydantic model for parameter validation."""
    from pydantic import BaseModel, Field

    class TestParameters(BaseModel):
        amplitude: float = Field(ge=0.0, le=1.0)
        frequency: float = Field(gt=0.0)
        num_averages: int = Field(ge=1, default=100)

    return TestParameters


@pytest.fixture
def sample_workflow_parameters_class() -> type[Any]:
    """Provide a sample workflow parameters class with nodes and parameters."""
    from pydantic import BaseModel, Field

    class NodeParams(BaseModel):
        node1: dict[str, Any] = Field(default_factory=dict)
        node2: dict[str, Any] = Field(default_factory=dict)

    class WorkflowParams(BaseModel):
        frequency: float = Field(gt=0.0)
        amplitude: float = Field(ge=0.0, le=1.0, default=0.5)

    class FullParams(BaseModel):
        nodes: NodeParams = Field(default_factory=NodeParams)
        parameters: WorkflowParams

    return FullParams


@pytest.fixture(scope="function")
def test_library() -> QualibrationLibrary[Any, Any]:
    """
    Provide a QualibrationLibrary instance loaded with test nodes.

    This fixture creates a library pointing to tests/fixtures/test_nodes,
    which properly sets filepath and other metadata on the test nodes
    during the scan process.

    Scope is explicitly set to "function" to ensure each test gets fresh
    node instances, maintaining test independence.
    """
    # Get path to test_nodes directory
    test_nodes_path = Path(__file__).parent / "fixtures" / "test_nodes"

    # Create library with set_active=False to avoid interfering with
    # other tests
    library: QualibrationLibrary[Any, Any] = QualibrationLibrary(library_folder=test_nodes_path, set_active=False)

    return library
