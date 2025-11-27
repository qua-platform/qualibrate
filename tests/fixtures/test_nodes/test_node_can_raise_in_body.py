"""
Simple test node without any actions.

This node provides basic functionality for testing node execution without the complexity of the action system.

It can raise an exception in the main body, and can test error handling in the orchestration layer when the error
occurs in the node's main body, before any actions are executed.
"""

from pydantic import Field

from qualibrate import NodeParameters, QualibrationNode


class Parameters(NodeParameters):
    """Parameters for simple test"""

    amplitude: float = Field(default=0.5, ge=0.0, le=1.0)
    frequency: float = Field(default=5.0e9, gt=0.0)
    num_points: int = Field(default=10, ge=1)

    """Parameters for error test"""
    should_fail: bool = Field(
        default=False,
        description="Whether the node should raise an error in body",
    )
    error_message: str = Field(
        default="Test error from node body",
        description="Error message to use",
    )
    error_type: str = Field(
        default="ValueError",
        description="Type of error to raise (ValueError or RuntimeError)",
    )


# Create the node
node: QualibrationNode[Parameters, Parameters] = QualibrationNode(  # type: ignore[type-var]
    name="node_raises_in_body",
    parameters=Parameters(),
)

# Raise error in main body if configured
if node.parameters.should_fail:
    error_msg = node.parameters.error_message
    if node.parameters.error_type == "RuntimeError":
        raise RuntimeError(error_msg)
    else:
        raise ValueError(error_msg)

# This code only runs if we didn't fail above
data = [
    node.parameters.amplitude * i for i in range(node.parameters.num_points)
]
node.results = {
    "data": data,
    "length": len(data),
    "amplitude": node.parameters.amplitude,
    "frequency": node.parameters.frequency,
    "error_raised": False,
}
