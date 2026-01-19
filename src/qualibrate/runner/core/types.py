from qualibrate import (
    NodeParameters,
    QualibrationGraph,
    QualibrationLibrary,
    QualibrationNode,
)
from qualibrate.core.parameters import RunnableParameters
from qualibrate.core.q_runnnable import QRunnable
from qualibrate.core.utils.type_protocols import MachineProtocol

__all__ = ["QNodeType", "QGraphType", "QLibraryType"]


QNodeType = QualibrationNode[NodeParameters, MachineProtocol]
GraphElementType = QRunnable[RunnableParameters, RunnableParameters]
QGraphType = QualibrationGraph[GraphElementType]
QLibraryType = QualibrationLibrary[QNodeType, GraphElementType]
