from .DB_operations import DBOperations
from .DB_management import DBManagement
from abc import ABC
from qualibrate_config.resolvers import (
    get_qualibrate_config,
    get_qualibrate_config_path,
)
from qualibrate.core.utils.logger_m import logger
from qualibrate.core.utils.db_utils.project_handling import  handle_missing_project

class PostgresBaseRepository(ABC, DBOperations):
    model = None  # subclasses MUST define

    def __init__(self, db_management):
        self._db = db_management

    @property
    def project(self) -> str:

        q_config_path = get_qualibrate_config_path()
        q_config = get_qualibrate_config(q_config_path)
        project = q_config.project
        if project is None:
            raise RuntimeError("No active project configured")
        return project

    # Implement abstract methods from DBOperations
    @handle_missing_project(default=None)
    def save(self, data):
        if self.model is None:
            raise NotImplementedError("Subclasses must define a model")
        with self._db.session(self.project) as session:
            obj = self.model(**data)
            session.add(obj)
            return obj

    @handle_missing_project(default=None)
    def load(self, id):
        if self.model is None:
            raise NotImplementedError("Subclasses must define a model")
        with self._db.session(self.project) as session:
            return session.get(self.model, id)

    @handle_missing_project(default=None)
    def update(self, id, data):
        if self.model is None:
            raise NotImplementedError("Subclasses must define a model")
        with self._db.session(self.project) as session:
            obj = session.get(self.model, id)
            if obj:
                for key, value in data.items():
                    setattr(obj, key, value)

    @handle_missing_project(default=None)
    def delete(self, id):
        if self.model is None:
            raise NotImplementedError("Subclasses must define a model")
        with self._db.session(self.project) as session:
            obj = session.get(self.model, id)
            if obj:
                session.delete(obj)
    #
    # def __init__(self, management: DBManagement, model):
    #     self._management = management
    #     self._model = model  # the SQLAlchemy model class
    #
    # def save(self, data) -> None:
    #     with self._management.session() as session:
    #         session.add(self._model(**data))
    #
    # def load(self, id):
    #     with self._management.session() as session:
    #         return session.get(self._model, id)
    #
    # def delete(self, id) -> None:
    #     with self._management.session() as session:
    #         obj = session.get(self._model, id)
    #         if obj:
    #             session.delete(obj)
    #
    # def update(self, id, data) -> None:
    #     with self._management.session() as session:
    #         obj = session.get(self._model, id)
    #         if obj:
    #             for key, value in data.items():
    #                 setattr(obj, key, value)