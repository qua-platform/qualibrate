from qualibrate.core.infrastructure.DB.models.machine_state_model import MachineState
from qualibrate.core.infrastructure.DB.postgres_base_repository import PostgresBaseRepository
from qualibrate.core.infrastructure.DB.postgres_management import PostgresManagement


class MachineStateRepository(PostgresBaseRepository):
    model = MachineState

    def __init__(self, db_management :PostgresManagement):
        super().__init__(db_management)
    #
    # def get_latest(self,project_name : str) :
    #     """Get the most recent QuamState."""
    #     with self._db.session(project_name) as session:
    #         return session.query(self.model) \
    #             .order_by(self.model.created_at.desc()) \
    #             .first()
    #
    # def get_history(self, project_name:str, limit=100):
    #     """Get QuamState history ordered by time."""
    #     with self._db.session(project_name) as session:
    #         return session.query(self.model) \
    #             .order_by(self.model.created_at.asc()) \
    #             .limit(limit) \
    #             .all()
    #
    # def get_by_date_range(self,project_name:str, start_date, end_date):
    #     """Get QuamStates within a date range."""
    #     with self._db.session(project_name) as session:
    #         return session.query(self.model) \
    #             .filter(self.model.created_at >= start_date) \
    #             .filter(self.model.created_at <= end_date) \
    #             .order_by(self.model.created_at.asc()) \
    #             .all()