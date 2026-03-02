from pydantic import BaseModel
from qualibrate_config.models.db import DatabaseStateConfig, DBConfig


class DBConfigRequest(BaseModel):
    host: str
    port: int
    database: str
    username: str | None = None
    password: str | None = None
    is_connected: bool = False

    def to_db_config(self) -> DBConfig:
        return DBConfig(
            {
                # "is_connected": self.is_connected,
                "host": self.host,
                "port": self.port,
                "database": self.database,
                "username": self.username,
                "password": self.password,
            }
        )

    def to_db_state_config(self) -> DatabaseStateConfig:
        return DatabaseStateConfig(
            {
                "is_connected": self.is_connected,
            }
        )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "host": "localhost",
                    "port": 5432,
                    "database": "my_project_db",
                    "username": "postgres",
                    "password": "postgres",
                }
            ]
        }
    }
