from qualibrate_config.resolvers import get_qualibrate_config

from qualibrate.core.infrastructure.DB.DBRegistry import DBRegistry
from qualibrate.core.infrastructure.DB.postgres_management import PostgresManagement
from qualibrate.core.utils.logger_m import logger


def init_db_at_startup() -> None:
    # Init DB registry
    DBRegistry.configure(PostgresManagement())
    try:
        db_manager = DBRegistry.get()
        db_manager.db_connect(get_qualibrate_config().project)
    except Exception as e:
        logger.warning(f"Could not connect to DB: {e}")
