import importlib
from pathlib import Path

import pytest

from qualibrate.models.outcome import Outcome
from qualibrate.qualibration_node import QualibrationNode
from qualibrate.utils.exceptions import StopInspection


def test_node_outcomes():
    try:
        QualibrationNode.modes.inspection = True
        with pytest.raises(StopInspection):
            importlib.import_module(
                "tests.integration.example_calibration_scripts."
                "1_node_with_partial_outcomes"
            )
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
        node, _summary = node.run()
        assert node.outcomes == {
            "q0": Outcome.SUCCESSFUL,
            "q1": Outcome.FAILED,
            "q2": Outcome.SUCCESSFUL,
        }
    finally:
        QualibrationNode.modes.inspection = False
