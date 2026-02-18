from abc import ABC, abstractmethod
from contextlib import contextmanager


class DBManagement(ABC):

    @abstractmethod
    def connect(self, config: dict) -> None: ...

    @abstractmethod
    def disconnect(self) -> None: ...

    @abstractmethod
    def is_connected(self) -> bool: ...

    @abstractmethod
    @contextmanager
    def session(self): ...