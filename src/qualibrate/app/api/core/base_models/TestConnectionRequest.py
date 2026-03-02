from pydantic import BaseModel
from qualibrate_config.models import DBConfig


class TestConnectionRequest(BaseModel):
    host: str
    port: int
    database: str
    username: str | None = None
    password: str | None = None

    def to_db_config(self) -> DBConfig:
        return DBConfig(
            {
                "host": self.host,
                "port": self.port,
                "database": self.database,
                "username": self.username,
                "password": self.password,
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
