from datetime import datetime

from sqlalchemy import Column, DateTime, Integer
from sqlalchemy.dialects.postgresql import JSONB

from .base import Base


class MachineState(Base):
    __tablename__ = "machine_state"

    id = Column(Integer, primary_key=True)
    created_at = Column(DateTime, default=datetime.now)
    content = Column(JSONB)
