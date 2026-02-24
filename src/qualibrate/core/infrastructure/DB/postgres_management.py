from contextlib import contextmanager
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from .DB_management import DBManagement
from qualibrate_config.resolvers import (
    get_qualibrate_config,
    get_qualibrate_config_path,
)
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
    def connect(self, key: str, config: dict) -> None:
        if key in self._engines:
            return  # already connected
        config_path = get_qualibrate_config_path()
        config = get_qualibrate_config(config_path).database
        if config is None:
            logger.warning("No database configuration found, skipping database connection")

        engine = create_engine(
            f"postgresql+psycopg2://{config['username']}:{config['password']}@"
            f"{config['host']}:{config.get('port', 5432)}/{config['database']}",
            pool_size=5,
            pool_pre_ping=True
        )

        # Fail fast
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))

        self._engines[key] = engine
        self._session_factories[key] = sessionmaker(bind=engine)

    # ---------------------------------------------------
    # DISCONNECT SINGLE
    # ---------------------------------------------------
    def disconnect(self, key: str) -> None:
        engine = self._engines.get(key)
        if engine:
            engine.dispose()

        self._engines.pop(key, None)
        self._session_factories.pop(key, None)

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
    def is_connected(self, key: str) -> bool:
        return key in self._session_factories

    # ---------------------------------------------------
    # SESSION
    # ---------------------------------------------------
    @contextmanager
    def session(self, key: str):
        if key not in self._session_factories:
            raise RuntimeError(f"No database connection configured for key '{key}'")

        session = self._session_factories[key]()

        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()