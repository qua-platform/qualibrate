from abc import ABC, abstractmethod
from typing import TYPE_CHECKING, Generic, Optional, TypeVar

if TYPE_CHECKING:
    from qualibrate.parameters import NodeParameters
    from qualibrate.qualibration_node import QualibrationNode


NodeTypeVar = TypeVar("NodeTypeVar", bound="QualibrationNode[NodeParameters]")


class StorageManager(ABC, Generic[NodeTypeVar]):
    """
    Abstract base class for managing the storage of calibration nodes.

    The `StorageManager` class provides an interface for saving the state of
    calibration nodes (`QualibrationNode`). It includes functionality for
    managing snapshots of the node's state.
    """

    snapshot_idx: Optional[int] = None

    @abstractmethod
    def save(self, node: NodeTypeVar) -> None:
        """
        Saves the current state of the provided node.

        This method is an abstract method, and should be implemented by any
        subclass to provide the logic for saving the state of a
        `QualibrationNode`.

        Args:
            node (QualibrationNode): The node whose state is to be saved.
        """
        pass
