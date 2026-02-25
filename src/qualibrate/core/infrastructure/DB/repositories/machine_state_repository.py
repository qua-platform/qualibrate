from qualibrate.core.infrastructure.DB.models.machine_state_model import MachineState
from qualibrate.core.infrastructure.DB.postgres_base_repository import PostgresBaseRepository
from qualibrate.core.infrastructure.DB.postgres_management import PostgresManagement


class MachineStateRepository(PostgresBaseRepository):
    model = MachineState

    def __init__(self, db_management :PostgresManagement):
        super().__init__(db_management)