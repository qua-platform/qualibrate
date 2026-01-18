from qualibrate import (
    NodeParameters,
    QualibrationGraph,
    QualibrationLibrary,
    QualibrationNode,
)
from qualibrate.parameters import RunnableParameters
from qualibrate.q_runnnable import QRunnable
from qualibrate.utils.type_protocols import MachineProtocol

__all__ = ["QNodeType", "QGraphType", "QLibraryType"]


QNodeType = QualibrationNode[NodeParameters, MachineProtocol]
GraphElementType = QRunnable[RunnableParameters, RunnableParameters]
QGraphType = QualibrationGraph[GraphElementType]
QLibraryType = QualibrationLibrary[QNodeType, GraphElementType]
