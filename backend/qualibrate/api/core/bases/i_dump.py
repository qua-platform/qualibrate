from abc import ABC, abstractmethod

from qualibrate.api.core.types import DocumentType


class IDump(ABC):
    @abstractmethod
    def dump(self) -> DocumentType:
        pass
