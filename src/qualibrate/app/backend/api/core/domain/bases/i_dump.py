from abc import ABC, abstractmethod

from pydantic import BaseModel


class IDump(ABC):
    @abstractmethod
    def dump(self) -> BaseModel:
        pass
