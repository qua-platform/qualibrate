from qualibrate.core import NodeParameters, QualibrationNode
from qualibrate.core.models.outcome import Outcome


class Parameters(NodeParameters):
    qubits: list[str] = ["q1", "q2", "q3", "q4"]
    str_value: str = "test"
    int_value: int = 1
    float_value: float = 1.0


node = QualibrationNode("test_node_with_results", parameters=Parameters())
node.parameters = Parameters(qubits=["q1", "q2", "q3", "q4"])


# Simulate calibration behavior in node
@node.run_action
def simulate_calibration(node: QualibrationNode):
    """Simulate calibration with specific success/failure patterns."""
    results = {}
    for target in node.parameters.targets:
        if target == "q1":
            # q1 succeeds
            results[target] = {"fidelity": 0.98, "error_type": None}
            node.outcomes[target] = Outcome.SUCCESSFUL
        elif target == "q2":
            # q2 fails with retriable error
            results[target] = {"fidelity": 0.92, "error_type": "retriable"}
            node.outcomes[target] = Outcome.FAILED
        elif target == "q3":
            # q3 fails with retriable error
            results[target] = {"fidelity": 0.89, "error_type": "retriable"}
            node.outcomes[target] = Outcome.FAILED
        else:  # q4
            results[target] = {"fidelity": 0.85, "error_type": "retriable"}
            node.outcomes[target] = Outcome.FAILED
    # Store results in namespace so they persist
    node.namespace["calibration_results"] = results
    return {"calibration_results": results}
