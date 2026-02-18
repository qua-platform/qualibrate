from .postgres_management import PostgresManagement
from .postgres_base_repository import PostgresBaseRepository

class StorageFacade:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._management = None
            cls._instance._operations = None
        return cls._instance

    def connect(self, config: dict, model) -> None:
        self._management = PostgresManagement()
        self._management.connect(config)
        self._operations = PostgresBaseRepository(self._management, model)

    def disconnect(self) -> None:
        if self._management:
            self._management.disconnect()
        self._management = None
        self._operations = None

    def is_connected(self) -> bool:
        return self._management is not None and self._management.is_connected()

    # ── public API ──────────────────────────────────────────────────

    def save(self, data) -> None:
        self._operations.save(data)

    def load(self, id):
        return self._operations.load(id)

    def delete(self, id) -> None:
        self._operations.delete(id)

    def update(self, id, data) -> None:
        self._operations.update(id, data)