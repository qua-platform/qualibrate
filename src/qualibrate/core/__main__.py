import logging
from pathlib import Path

from qualibrate.core.parameters import NodeParameters, RunnableParameters
from qualibrate.core.q_runnnable import QRunnable
from qualibrate.core.qualibration_node import QualibrationNode
from qualibrate.core.utils.type_protocols import MachineProtocol

if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG)
    from qualibrate.core.qualibration_library import QualibrationLibrary

    library_folder = Path(__file__).parent.parent / "calibrations"
    library = QualibrationLibrary[
        QualibrationNode[NodeParameters, MachineProtocol],
        QRunnable[RunnableParameters, RunnableParameters],
    ](library_folder=library_folder)

    print(library.nodes)
    print(library.graphs)
