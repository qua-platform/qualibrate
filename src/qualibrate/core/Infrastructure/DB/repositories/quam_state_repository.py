from qualibrate.core.Infrastructure.DB.DB_management import DBManagement
from qualibrate.core.Infrastructure.DB.DB_operations import DBOperations
from qualibrate.core.Infrastructure.DB.models.quam_state_model import QuamState
from qualibrate.core.Infrastructure.DB.postgres_base_repository import PostgresBaseRepository
from qualibrate.core.Infrastructure.DB.postgres_management import PostgresManagement


class QuamStateRepository(PostgresBaseRepository):
    model = QuamState

    def __init__(self, db_management :PostgresManagement):
        super().__init__(db_management)

    def get_latest(self):
        """Get the most recent QuamState."""
        with self._db.session() as session:
            return session.query(self.model) \
                .order_by(self.model.created_at.desc()) \
                .first()

    def get_history(self, limit=100):
        """Get QuamState history ordered by time."""
        with self._db.session() as session:
            return session.query(self.model) \
                .order_by(self.model.created_at.asc()) \
                .limit(limit) \
                .all()

    def get_by_date_range(self, start_date, end_date):
        """Get QuamStates within a date range."""
        with self._db.session() as session:
            return session.query(self.model) \
                .filter(self.model.created_at >= start_date) \
                .filter(self.model.created_at <= end_date) \
                .order_by(self.model.created_at.asc()) \
                .all()