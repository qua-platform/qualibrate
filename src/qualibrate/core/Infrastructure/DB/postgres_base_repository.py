from .DB_operations import DBOperations
from .DB_management import DBManagement
from abc import ABC

class PostgresBaseRepository(ABC, DBOperations):
    model = None  # subclasses MUST define

    def __init__(self, db_management):
        self._db = db_management

    # Implement abstract methods from DBOperations
    def save(self, data):
        if self.model is None:
            raise NotImplementedError("Subclasses must define a model")
        with self._db.session() as session:
            obj = self.model(**data)
            session.add(obj)
            return obj

    def load(self, id):
        if self.model is None:
            raise NotImplementedError("Subclasses must define a model")
        with self._db.session() as session:
            return session.get(self.model, id)

    def update(self, id, data):
        if self.model is None:
            raise NotImplementedError("Subclasses must define a model")
        with self._db.session() as session:
            obj = session.get(self.model, id)
            if obj:
                for key, value in data.items():
                    setattr(obj, key, value)

    def delete(self, id):
        if self.model is None:
            raise NotImplementedError("Subclasses must define a model")
        with self._db.session() as session:
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