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

    input_parameters = {}

    with pytest.raises(RuntimeError):
        library.run_node("basic_node", input_parameters=input_parameters)

    storage_manager = LocalStorageManager(root_data_folder=tmp_path)
    library.nodes["basic_node"].storage_manager = storage_manager

    library.run_node("basic_node", input_parameters=input_parameters)
