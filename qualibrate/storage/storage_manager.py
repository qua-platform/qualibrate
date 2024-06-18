from abc import ABC, abstractmethod
from typing import TYPE_CHECKING, Optional

if TYPE_CHECKING:
    from qualibrate.qualibration_node import QualibrationNode


class StorageManager(ABC):
    snapshot_idx: Optional[int] = None

    @abstractmethod
    def save(self, node: "QualibrationNode") -> None:
        pass
