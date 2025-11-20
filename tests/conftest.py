"""
Shared fixtures for qualibrate-runner tests.

This module provides common fixtures used across unit and integration tests,
including mock objects, sample data, and test utilities.
"""

from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import Mock

import pytest

from qualibrate_runner.config.models import State
from qualibrate_runner.core.models.common import RunError, StateUpdate
from qualibrate_runner.core.models.enums import RunnableType, RunStatusEnum
from qualibrate_runner.core.models.last_run import LastRun


@pytest.fixture
def aware_datetime():
    """Provide a timezone-aware datetime for testing."""
    return datetime(2024, 1, 15, 10, 30, 0, tzinfo=timezone.utc)


@pytest.fixture
def later_datetime():
    """Provide a later timezone-aware datetime for testing durations."""
    return datetime(2024, 1, 15, 10, 30, 5, 500000, tzinfo=timezone.utc)


@pytest.fixture
def sample_traceback():
    """Provide a sample traceback as list of strings."""
    return [
        '  File "/path/to/node.py", line 42, in run\n'
        "    result = self.process_data()\n",
        '  File "/path/to/node.py", line 55, in process_data\n'
        '    raise ValueError("Invalid data")\n',
    ]


@pytest.fixture
def sample_run_error(sample_traceback):
    """Provide a sample RunError instance."""
    return RunError(
        error_class="ValueError",
        message="Invalid data",
        traceback=sample_traceback,
    )


@pytest.fixture
def sample_state_update():
    """Provide a sample StateUpdate instance."""
    return StateUpdate(
        key="qubit_0",
        attr="resonance_frequency",
        old=5.0e9,
        new=5.1e9,
        updated=True,
    )


@pytest.fixture
def sample_last_run_running(aware_datetime):
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
def sample_last_run_finished(aware_datetime, later_datetime):
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
def sample_last_run_error(aware_datetime, later_datetime, sample_run_error):
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
def fresh_state():
    """Provide a fresh State instance with no execution history."""
    return State()


@pytest.fixture
def mock_node():
    """Provide a mock QualibrationNode.

    Note: This cannot be used directly with State() due to Pydantic
    validation. Use state_with_node fixture instead.
    """
    node = Mock()
    node.name = "test_node"
    node.snapshot_idx = 42
    node.run_summary = None
    node.state_updates = {}
    return node


@pytest.fixture
def mock_workflow():
    """Provide a mock workflow (QGraph).

    Note: This cannot be used directly with State() due to Pydantic
    validation. Use state_with_workflow fixture instead.
    """
    workflow = Mock()
    workflow.name = "test_workflow"
    workflow.snapshot_idx = 100
    workflow.run_summary = None
    return workflow


@pytest.fixture
def state_with_node(mock_node):
    """Provide a State with a mock node (bypassing validation)."""
    return State.model_construct(run_item=mock_node)


@pytest.fixture
def state_with_workflow(mock_workflow):
    """Provide a State with a mock workflow (bypassing validation)."""
    return State.model_construct(run_item=mock_workflow)


# Run job fixtures


@pytest.fixture
def mock_library(mock_workflow):
    """Provide a mock QualibrationLibrary."""
    library = Mock()
    library.graphs = {"test_workflow": mock_workflow}
    return library


@pytest.fixture
def sample_parameters_class():
    """Provide a sample Pydantic model for parameter validation."""
    from pydantic import BaseModel, Field

    class TestParameters(BaseModel):
        amplitude: float = Field(ge=0.0, le=1.0)
        frequency: float = Field(gt=0.0)
        num_averages: int = Field(ge=1, default=100)

    return TestParameters


@pytest.fixture
def sample_workflow_parameters_class():
    """Provide a sample workflow parameters class with nodes and parameters."""
    from pydantic import BaseModel, Field

    class NodeParams(BaseModel):
        node1: dict = Field(default_factory=dict)
        node2: dict = Field(default_factory=dict)

    class WorkflowParams(BaseModel):
        frequency: float = Field(gt=0.0)
        amplitude: float = Field(ge=0.0, le=1.0, default=0.5)

    class FullParams(BaseModel):
        nodes: NodeParams = Field(default_factory=NodeParams)
        parameters: WorkflowParams

    return FullParams


@pytest.fixture(scope="function")
def test_library():
    """
    Provide a QualibrationLibrary instance loaded with test nodes.

    This fixture creates a library pointing to tests/fixtures/test_nodes,
    which properly sets filepath and other metadata on the test nodes
    during the scan process.

    Scope is explicitly set to "function" to ensure each test gets fresh
    node instances, maintaining test independence.
    """
    from qualibrate import QualibrationLibrary

    # Get path to test_nodes directory
    test_nodes_path = Path(__file__).parent / "fixtures" / "test_nodes"

    # Create library with set_active=False to avoid interfering with
    # other tests
    library = QualibrationLibrary(
        library_folder=test_nodes_path, set_active=False
    )

    return library
