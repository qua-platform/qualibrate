import importlib
from pathlib import Path

from qualibrate.outcome import Outcome
from qualibrate.qualibration_node import QualibrationNode
from qualibrate.utils.exceptions import StopInspection


def test_node_outcomes():
    try:
        QualibrationNode.modes.inspection = True
        try:
            importlib.import_module(
                "tests.example_calibration_scripts.1_node_with_partial_outcomes"
            )
        except StopInspection:
            pass
        nodes = {}
        QualibrationNode.scan_node_file(
            Path(__file__)
            .parents[1]
            .joinpath(
                "example_calibration_scripts", "1_node_with_partial_outcomes.py"
            ),
            nodes,
        )
        node = nodes["node_part_outcome"]
        node.run()
        assert node.outcomes == {
            "q0": Outcome.SUCCESSFUL,
            "q1": Outcome.FAILED,
            "q2": Outcome.SUCCESSFUL,
        }
    finally:
        QualibrationNode.modes.inspection = False
