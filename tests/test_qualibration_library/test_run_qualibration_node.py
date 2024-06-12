from pathlib import Path
import pytest
from qualibrate import QualibrationLibrary, QualibrationNode
from qualibrate.storage.local_storage_manager import LocalStorageManager


def test_run_calibration_node_from_library(tmp_path):
    folder = Path(
        "/Users/serwan/Repositories/qualibrate/qualibrate-core/tests/example_calibration_scripts"
    )
    library = QualibrationLibrary(library_folder=folder)

    assert list(library.nodes) == ["basic_node"]

    library.run_node("basic_node", input_parameters={})
