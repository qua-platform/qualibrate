from contextlib import contextmanager
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from .DB_management import DBManagement
from qualibrate_config.resolvers import (
    get_qualibrate_config,
    get_qualibrate_config_path,
)
from qualibrate_config.models import DBConfig
from qualibrate.core.utils.logger_m import logger


class PostgresManagement(DBManagement):
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._engines = {}
            cls._instance._session_factories = {}
        return cls._instance

    # ---------------------------------------------------
    # CONNECT
    # ---------------------------------------------------
    #    def db_connect(self, project_name: str, config: DBConfig) -> None:
    def db_connect(self, project_name: str) -> None:
        if project_name in self._engines:
            return  # already connected
        config_path = get_qualibrate_config_path()
        config = get_qualibrate_config(config_path).database
        if config is None:
            logger.warning("No database configuration found, skipping database connection")

        engine = create_engine(
            f"postgresql+psycopg2://{config.username}:{config.password}@"
            f"{config.host}:{config.port}/{config.database}",
            pool_size=5,
            pool_pre_ping=True
        )

        # Fail fast
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))

        self._engines[project_name] = engine
        self._session_factories[project_name] = sessionmaker(bind=engine)

    # ---------------------------------------------------
    # DISCONNECT SINGLE
    # ---------------------------------------------------
    def disconnect(self, project_name: str) -> None:
        engine = self._engines.get(project_name)
        if engine:
            engine.dispose()

        self._engines.pop(project_name, None)
        self._session_factories.pop(project_name, None)

    # ---------------------------------------------------
    # DISCONNECT ALL
    # ---------------------------------------------------
    def disconnect_all(self) -> None:
        for engine in self._engines.values():
            engine.dispose()

        self._engines.clear()
        self._session_factories.clear()

    # ---------------------------------------------------
    # STATUS
    # ---------------------------------------------------
    def is_connected(self, project_name: str) -> bool:
        return project_name in self._session_factories

    # ---------------------------------------------------
    # SESSION
    # ---------------------------------------------------
    @contextmanager
    def session(self, project_name: str):
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