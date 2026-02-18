from contextlib import contextmanager
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from .DB_management import DBManagement


class PostgresManagement(DBManagement):
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._engine = None
            cls._instance._session_factory = None
        return cls._instance

    def connect(self, config: dict) -> None:
        if self._engine is not None:
            return # already connected
        #need to be edited, need to pull info from config
        self._engine = create_engine(
            f"postgresql+psycopg2://{config['user']}:{config['password']}@{config['host']}:{config.get('port', 5432)}/{config['db']}",
            pool_size=5,
            pool_pre_ping=True
        )
        # eager validation
        with self._engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        self._session_factory = sessionmaker(bind=self._engine)

    def disconnect(self) -> None:
        if self._engine:
            self._engine.dispose()
        self._engine = None
        self._session_factory = None

    def is_connected(self) -> bool:
        return self._session_factory is not None

    @contextmanager
    def session(self):
        if not self.is_connected():
            raise RuntimeError("Postgres is not connected")
        s = self._session_factory()
        try:
            yield s
            s.commit()
        except Exception:
            s.rollback()
            raise
        finally:
            s.close()