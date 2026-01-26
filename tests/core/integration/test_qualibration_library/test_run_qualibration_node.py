from pathlib import Path

from qualibrate.core import QualibrationLibrary


def test_library_scan(tmp_path):
    folder = Path(__file__).parents[1] / "example_calibration_scripts"
    library = QualibrationLibrary(library_folder=folder)
    assert list(library.nodes) == ["basic_node", "node_part_outcome"]


def test_run_calibration_node_from_library(tmp_path, mocker, qualibrate_config_and_path_mocked):
    folder = Path(__file__).parents[1] / "example_calibration_scripts"
    library = QualibrationLibrary(library_folder=folder)
    mocked = mocker.patch("qualibrate.core.qualibration_node.QualibrationNode.save")
    node = library.nodes.get_nocopy("basic_node")
    library.run_node("basic_node", node.parameters_class())
    mocked.assert_called_once()
