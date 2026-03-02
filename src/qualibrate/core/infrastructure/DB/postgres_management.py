import atexit
from collections.abc import Generator
from contextlib import contextmanager
from typing import Any

from qualibrate_config.models import DBConfig
from qualibrate_config.resolvers import (
    get_qualibrate_config,
    get_qualibrate_config_path,
)
from sqlalchemy import Engine, create_engine, text
from sqlalchemy.engine import URL
from sqlalchemy.exc import OperationalError, SQLAlchemyError
from sqlalchemy.orm import Session, sessionmaker

from qualibrate.core.utils.logger_m import logger

from .DB_management import DBManagement


class PostgresManagement(DBManagement):
    _instance = None
    _engines: dict[str, Engine] = {}
    _session_factories: dict[str, sessionmaker[Session]] = {}

    def __new__(cls, *args: Any, **kwargs: Any) -> "PostgresManagement":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._engines = {}
            cls._instance._session_factories = {}
            atexit.register(cls._instance.disconnect_all)
        return cls._instance

    def test_connection(self, database_config: DBConfig) -> None:
        engine = self._connect_to_db(database_config)
        try:
            engine.dispose()
        except Exception as e:
            raise Exception(f"Error disposing engine: {e}") from e

    # def _disconnect_db(self, engine):
    #     try:
    #         engine.dispose()
    #     except Exception as e:
    #         raise Exception(f"Error disposing engine: {e}")

    def _connect_to_db(self, database_config: DBConfig) -> Engine:
        try:
            url = URL.create(
                "postgresql+psycopg2",
                username=database_config.username,
                password=database_config.password,
                host=database_config.host,
                port=database_config.port,
                database=database_config.database,
            )
            engine = create_engine(url, pool_size=5, pool_pre_ping=True)
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
        except OperationalError as e:
            raise RuntimeError(f"Could not connect to database, check your credentials and host: {e}") from e
        except SQLAlchemyError as e:
            raise RuntimeError(f"Database error during connect: {e}") from e

        return engine

    def db_connect(self, project_name: str) -> None:
        if project_name in self._engines:
            return
        config_path = get_qualibrate_config_path()
        config = get_qualibrate_config(config_path).database
        if config is None:
            logger.warning("No database configuration found, skipping database connection")
            return

        engine = self._connect_to_db(config)
        self._engines[project_name] = engine
        self._session_factories[project_name] = sessionmaker(bind=engine)

    def db_disconnect(self, project_name: str) -> None:
        engine = self._engines.get(project_name)
        if engine:
            try:
                engine.dispose()
                # self._disconnect_db(engine)
            except Exception as e:
                raise Exception(f"Error disposing engine for project '{project_name}': {e}") from e
        else:
            logger.warning(f"No database connection found for project '{project_name}'")
        self._engines.pop(project_name, None)
        self._session_factories.pop(project_name, None)

    def disconnect_all(self) -> None:
        for project_name, engine in self._engines.items():
            try:
                engine.dispose()
                # self._disconnect_db(engine)
            except Exception as e:
                logger.warning(f"Error disposing engine for project '{project_name}': {e}")
        self._engines.clear()
        self._session_factories.clear()

    def is_connected(self, project_name: str) -> bool:
        return project_name in self._session_factories

    @contextmanager
    def session(self, project_name: str) -> Generator[Session, None, None]:
        if project_name not in self._session_factories:
            raise RuntimeError(f"No database connection configured for project '{project_name}'")

        session = self._session_factories[project_name]()

        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()
