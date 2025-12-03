from unittest.mock import patch
from pathlib import Path
from qualibrate.qualibration_library import QualibrationLibrary

def load_local_qualibration_library(config):
    """
    Creates a QualibrationLibrary with get_qualibrate_config and
    get_qualibrate_config_path patched to your desired values.
    """
    from qualibrate import qualibration_node

    ctx1 = patch("qualibrate.qualibration_node.get_qualibrate_config_path")
    ctx2 = patch(
        "qualibrate.qualibration_node.get_qualibrate_config",
        return_value=config,
    )

    # Return a context manager that patches AND yields the library
    class PatchedLibraryContext:
        def __enter__(self):
            self._first_enter_result = ctx1.__enter__()
            self._second_enter_result = ctx2.__enter__()
            cal_path = Path(__file__).parent / "calibration_nodes_and_graphs_for_testing"
            self.lib = QualibrationLibrary(cal_path)
            return self.lib

        def __exit__(self, exc_type, exc, tb):
            ctx1.__exit__(exc_type, exc, tb)
            ctx2.__exit__(exc_type, exc, tb)

    return PatchedLibraryContext()