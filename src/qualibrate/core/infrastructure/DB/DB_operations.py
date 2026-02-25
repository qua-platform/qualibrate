from abc import ABC, abstractmethod


class DBOperations(ABC):
    @abstractmethod
    def save(self, data) -> None: ...

    @abstractmethod
    def load(self, id): ...

    @abstractmethod
    def delete(self, id) -> None: ...

    @abstractmethod
    def update(self, id, data) -> None: ...
