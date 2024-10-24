from pathlib import Path

from qualibrate import QualibrationLibrary


def test_library_scan(tmp_path):
    folder = Path(__file__).parents[1] / "example_calibration_scripts"
    library = QualibrationLibrary(library_folder=folder)
    assert list(library.nodes) == ["basic_node", "node_part_outcome"]


def test_run_calibration_node_from_library(tmp_path, mocker):
    folder = Path(__file__).parents[1] / "example_calibration_scripts"
    library = QualibrationLibrary(library_folder=folder)
    mocker.patch(
        "qualibrate.storage.local_storage_manager.LocalStorageManager.save"
    )
    node = library.nodes["basic_node"]
    # TODO: Mock save method or need to use non-default path for exporting
    #  results
    library.run_node("basic_node", node.parameters_class())
