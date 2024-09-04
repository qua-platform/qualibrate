from pydantic import BaseModel


class Versioned(BaseModel):
    config_version: int = 1
