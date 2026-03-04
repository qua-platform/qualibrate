from typing import Any

from qualibrate_config.resolvers import (
    get_qualibrate_config,
    get_qualibrate_config_path,
)

from qualibrate.core.utils.db_utils.project_handling import handle_missing_project

from .DB_operations import DBOperations
from .postgres_management import PostgresManagement


class PostgresBaseRepository(DBOperations):
    model: type[Any] | None = None

    def __init__(self, db_management: PostgresManagement) -> None:
        if self.model is None:
            raise NotImplementedError("Subclasses must define a model")
        self._db: PostgresManagement = db_management
        self._project: str | None = None

    @property
    def project(self) -> str:
        if self._project is None:
            q_config = get_qualibrate_config(get_qualibrate_config_path())
            self._project = q_config.project
        if self._project is None:
            raise RuntimeError("No active project configured")
        return self._project

    @handle_missing_project(default=None)
    def save(self, data: Any) -> Any:
        with self._db.session(self.project) as session:
            obj = self.model(**data)  # type: ignore[misc]
            session.add(obj)
            session.expunge(obj)
        return obj

    @handle_missing_project(default=None)
    def load(self, id: Any) -> Any:
        assert self.model is not None  # Validated in __init__
        obj = None
        with self._db.session(self.project) as session:
            obj = session.get(self.model, id)
            if obj:
                session.expunge(obj)
        return obj

    @handle_missing_project(default=None)
    def update(self, id: Any, data: Any) -> Any:
        assert self.model is not None  # Validated in __init__
        obj = None
        with self._db.session(self.project) as session:
            obj = session.get(self.model, id)
            if obj:
                for key, value in data.items():
                    setattr(obj, key, value)
                session.expunge(obj)
        return obj

    @handle_missing_project(default=None)
    def delete(self, id: Any) -> None:
        assert self.model is not None  # Validated in __init__
        with self._db.session(self.project) as session:
            obj = session.get(self.model, id)
            if obj:
                session.delete(obj)
