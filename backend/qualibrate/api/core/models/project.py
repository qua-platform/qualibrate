from datetime import datetime

from pydantic import BaseModel


class Project(BaseModel):
    name: str
    nodes_number: int
    created_at: datetime
    last_modified_at: datetime
