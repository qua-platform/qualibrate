from abc import ABC, abstractmethod
from collections.abc import Generator
from contextlib import contextmanager
from typing import Any

from qualibrate_config.models import DBConfig


class DBManagement(ABC):
    @abstractmethod
    def db_connect(self, project_name: str) -> None: ...

    @abstractmethod
    def test_connection(self, database_config: DBConfig) -> None: ...

    @abstractmethod
    def db_disconnect(self, project_name: str) -> None: ...

    @abstractmethod
    def disconnect_all(self) -> None: ...

    @abstractmethod
    def is_connected(self, project_name: str) -> bool: ...

    @abstractmethod
    @contextmanager
    def session(self, project_name: str) -> Generator[Any, None, None]: ...
