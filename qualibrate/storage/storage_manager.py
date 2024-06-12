from abc import ABC, abstractmethod
from typing import Optional


class StorageManager(ABC):
    snapshot_idx: Optional[int] = None

    @abstractmethod
    def save(self, node):
        pass
