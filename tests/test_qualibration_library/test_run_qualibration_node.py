from pathlib import Path

from qualibrate import QualibrationLibrary


def test_run_calibration_node_from_library(tmp_path):
    folder = Path(__file__).parents[1] / "example_calibration_scripts"
    library = QualibrationLibrary(library_folder=folder)

    assert list(library.nodes) == ["basic_node"]
    # TODO: Mock save method or need to use non-default path for exporting results
    library.run_node("basic_node", input_parameters={})
