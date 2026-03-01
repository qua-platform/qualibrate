from abc import ABC, abstractmethod
from typing import Any


class DBOperations(ABC):
    @abstractmethod
    def save(self, data: Any) -> None: ...

    @abstractmethod
    def load(self, id: Any) -> Any: ...

    @abstractmethod
    def delete(self, id: Any) -> None: ...

    @abstractmethod
    def update(self, id: Any, data: Any) -> None: ...
