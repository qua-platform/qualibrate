"""
Test node with action that calls a subroutine.

This node tests error handling when the error occurs in a subroutine
that is called from an action, ensuring the full call chain is captured.
"""

from typing import Any

from pydantic import Field
from qualibrate import NodeParameters, QualibrationNode


class Parameters(NodeParameters):
    """Parameters for subroutine test."""

    amplitude: float = Field(default=0.5, ge=0.0, le=1.0)
    num_points: int = Field(default=10, ge=1)
    trigger_subroutine_error: bool = Field(
        default=False,
        description="Whether to trigger error in subroutine",
    )
    error_message: str = Field(
        default="Error from subroutine",
        description="Error message to raise",
    )


# Create the node
node: QualibrationNode[Parameters, Any] = QualibrationNode(
    name="node_with_subroutine",
    parameters=Parameters(),
)


def helper_function(amplitude: float, num_points: int) -> list[float]:
    """Helper function that processes data.

    This subroutine is called by the action. If parameters trigger an error,
    it will raise from within this function.
    """
    # Do some processing
    data = [amplitude * i for i in range(num_points)]

    # This line will raise if we access out of bounds
    # We use this to trigger an error in the subroutine
    _ = data[num_points]  # IndexError: list index out of range

    return data


def another_helper(value: float, message: str) -> float:
    """Another helper that can raise a ValueError.

    This demonstrates a deeper call stack within the node file.
    """
    if value < 0:
        raise ValueError(message)
    return value * 2


@node.run_action
def prepare_data(node: QualibrationNode[Parameters, Any]) -> dict[str, Any]:
    """Generate measurement data based on parameters."""
    # Simple data generation without errors
    data = [
        node.parameters.amplitude * i for i in range(node.parameters.num_points)
    ]
    return {"data": data, "data_length": len(data)}


@node.run_action(skip_if=not node.parameters.trigger_subroutine_error)  # type: ignore[misc]
def process_with_subroutine(
    node: QualibrationNode[Parameters, Any],
) -> dict[str, Any]:
    """Process data using a helper function.

    This action calls helper_function, which will raise an IndexError
    when trigger_subroutine_error is True.
    """
    # Call the helper function - error will occur inside it
    result = helper_function(
        node.parameters.amplitude, node.parameters.num_points
    )
    return {"processed": result}


@node.run_action
def finalize(node: QualibrationNode[Parameters, Any]) -> dict[str, str]:
    """Finalize results."""
    return {"status": "completed"}


node.results = node.namespace
