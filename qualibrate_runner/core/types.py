from typing import Any

from qualibrate import (
    NodeParameters,
    QualibrationGraph,
    QualibrationLibrary,
    QualibrationNode,
)

__all__ = ["QNodeType", "QGraphType", "QLibraryType"]

QNodeType = QualibrationNode[NodeParameters, Any]
QGraphType = QualibrationGraph[QNodeType]
QLibraryType = QualibrationLibrary[QNodeType]
