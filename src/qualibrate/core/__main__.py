import logging
from pathlib import Path

from qualibrate.parameters import NodeParameters, RunnableParameters
from qualibrate.q_runnnable import QRunnable
from qualibrate.qualibration_node import QualibrationNode
from qualibrate.utils.type_protocols import MachineProtocol

if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG)
    from qualibrate import QualibrationLibrary

    library_folder = Path(__file__).parent.parent / "calibrations"
    library = QualibrationLibrary[
        QualibrationNode[NodeParameters, MachineProtocol],
        QRunnable[RunnableParameters, RunnableParameters],
    ](library_folder=library_folder)

    print(library.nodes)
    print(library.graphs)
