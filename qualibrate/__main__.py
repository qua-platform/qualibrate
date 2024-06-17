import logging
from pathlib import Path

if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG)
    from qualibrate import QualibrationLibrary

    library_folder = Path(__file__).parent.parent / "calibrations"
    library = QualibrationLibrary(library_folder=library_folder)

    print(library.nodes)
