# qualibrate/core/infrastructure/DB/utils.py
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError, OperationalError
from qualibrate_config.models import DBConfig

def test_db_connection_config(db_config: DBConfig) -> None:
    """
    Test a DB connection using the provided DBConfig.
    Raises an exception if connection fails.
    """
    temp_engine = None
    try:
        temp_engine = create_engine(
            f"postgresql+psycopg2://{db_config.username}:{db_config.password}@"
            f"{db_config.host}:{db_config.port}/{db_config.database}",
            pool_size=1,
            pool_pre_ping=True,
        )
        with temp_engine.connect() as conn:
            conn.execute(text("SELECT 1"))

    except (OperationalError, SQLAlchemyError) as e:
        raise RuntimeError(f"Connection failed: {e}") from e

    finally:
        if temp_engine:
            temp_engine.dispose()